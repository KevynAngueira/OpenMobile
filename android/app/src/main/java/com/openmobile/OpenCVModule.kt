package com.openmobile

import android.util.Log
import android.graphics.Bitmap
import android.util.Base64
import com.facebook.react.bridge.*

import org.opencv.android.OpenCVLoader
import org.opencv.core.Core
import org.opencv.core.Mat
import org.opencv.core.Scalar
import org.opencv.android.Utils
import org.opencv.videoio.VideoCapture
import org.opencv.videoio.Videoio
import org.opencv.imgproc.Imgproc

import org.opencv.core.Point
import org.opencv.core.Size
import org.opencv.core.RotatedRect
import org.opencv.core.MatOfPoint
import org.opencv.core.MatOfPoint2f
import org.opencv.core.CvType
import org.opencv.core.Rect

import java.io.ByteArrayOutputStream
import android.media.MediaMetadataRetriever

import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel
import java.io.FileInputStream
import java.nio.FloatBuffer

import android.content.Context
import java.io.InputStream

import ai.onnxruntime.*

class OpenCVModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "OpenCV"

    init {
        // Load OpenCV library
        if (!OpenCVLoader.initDebug()) {
            throw RuntimeException("Unable to load OpenCV")
        }
    }
    
    private val LAB_LOWER = Scalar(55.0, 142.0, 100.0)
    private val LAB_UPPER = Scalar(255.0, 255.0, 136.0)

    private val pcaData by lazy {
        loadPCA(reactApplicationContext)
    }
    private val pcaMean: FloatArray get() = pcaData.first
    private val pcaComponents: Array<FloatArray> get() = pcaData.second


    object NpyReader {
        // Read header and return (shape:IntArray, fortranOrder:Boolean, dtype:String)
        private fun parseHeader(header: String): Triple<IntArray, Boolean, String> {
            // header is like: "{'descr': '<f4', 'fortran_order': False, 'shape': (5, 9216), }"
            val descrRe = Regex("'descr'\\s*:\\s*'([^']+)'")
            val fortranRe = Regex("'fortran_order'\\s*:\\s*(True|False)")
            val shapeRe = Regex("'shape'\\s*:\\s*\\(([^\\)]*)\\)")

            val descr = descrRe.find(header)?.groupValues?.get(1) ?: throw RuntimeException("No descr")
            val fortran = fortranRe.find(header)?.groupValues?.get(1) == "True"
            val shapeStr = shapeRe.find(header)?.groupValues?.get(1)?.trim() ?: throw RuntimeException("No shape")
            val dims = if (shapeStr.isEmpty()) intArrayOf() else shapeStr.split(",").map { it.trim() }.filter { it.isNotEmpty() }.map { it.toInt() }.toIntArray()
            return Triple(dims, fortran, descr)
        }

        fun readFloat1D(stream: InputStream): FloatArray {
            stream.use { s ->
                val header = readHeader(s)
                val (shape, fortran, descr) = parseHeader(header)
                require(!fortran) { "Fortran order not supported" }
                require(descr == "<f4" || descr == "|f4" || descr == " <f4") { "Only little-endian float32 supported, got $descr" }
                val n = if (shape.isEmpty()) 1 else shape[0]
                val buf = ByteArray(n * 4)
                var read = 0
                while (read < buf.size) {
                    val r = s.read(buf, read, buf.size - read)
                    if (r < 0) throw RuntimeException("Unexpected EOF")
                    read += r
                }
                val bb = ByteBuffer.wrap(buf).order(ByteOrder.LITTLE_ENDIAN)
                val out = FloatArray(n)
                for (i in 0 until n) out[i] = bb.float
                return out
            }
        }

        fun readFloat2D(stream: InputStream): Array<FloatArray> {
            stream.use { s ->
                val header = readHeader(s)
                val (shape, fortran, descr) = parseHeader(header)
                require(!fortran) { "Fortran order not supported" }
                require(descr == "<f4" || descr == "|f4") { "Only little-endian float32 supported, got $descr" }
                require(shape.size == 2) { "Expected 2D array, got dims=${shape.contentToString()}" }
                val rows = shape[0]
                val cols = shape[1]
                val buf = ByteArray(rows * cols * 4)
                var read = 0
                while (read < buf.size) {
                    val r = s.read(buf, read, buf.size - read)
                    if (r < 0) throw RuntimeException("Unexpected EOF")
                    read += r
                }
                val bb = ByteBuffer.wrap(buf).order(ByteOrder.LITTLE_ENDIAN)
                val out = Array(rows) { FloatArray(cols) }
                for (r in 0 until rows) {
                    for (c in 0 until cols) {
                        out[r][c] = bb.float
                    }
                }
                return out
            }
        }

        private fun readHeader(s: InputStream): String {
            // Read magic string and header length per .npy format
            val magic = ByteArray(6)
            var r = s.read(magic)
            if (r != 6) throw RuntimeException("Failed to read magic")
            val magicStr = String(magic)
            if (!magicStr.startsWith("\u0089NUMPY")) {
                // Some python versions produce \x93NUMPY; accept that too
                if (!magicStr.startsWith("\u0093NUMPY") && !magicStr.contains("NUMPY")) throw RuntimeException("Not a .npy file")
            }
            // read version
            val ver = ByteArray(2)
            s.read(ver)
            val major = ver[0].toInt() and 0xFF
            val minor = ver[1].toInt() and 0xFF
            // header length depends on version
            val headerLenBytes = if (major == 1) 2 else 4
            val lenBuf = ByteArray(headerLenBytes)
            s.read(lenBuf)
            val headerLen = if (headerLenBytes == 2) {
                ByteBuffer.wrap(lenBuf).order(ByteOrder.LITTLE_ENDIAN).short.toInt() and 0xFFFF
            } else {
                ByteBuffer.wrap(lenBuf).order(ByteOrder.LITTLE_ENDIAN).int
            }
            val headerBytes = ByteArray(headerLen)
            var read = 0
            while (read < headerLen) {
                val rr = s.read(headerBytes, read, headerLen - read)
                if (rr < 0) throw RuntimeException("Unexpected EOF reading header")
                read += rr
            }
            return String(headerBytes, Charsets.UTF_8)
        }
    }

    private fun loadPCA(context: Context): Pair<FloatArray, Array<FloatArray>> {
        // Make sure you placed pca_mean.npy and pca_components.npy in src/main/assets/
        val meanStream = context.assets.open("pca_mean.npy")
        val componentsStream = context.assets.open("pca_components.npy")

        val mean = NpyReader.readFloat1D(meanStream)
        val components = NpyReader.readFloat2D(componentsStream)

        Log.i("PCA", "Loaded PCA mean length=${mean.size}, components shape=[${components.size}, ${components[0].size}]")

        return Pair(mean, components)
    }


    private fun applyLabMask(frame: Mat): Mat {
        val lab = Mat()
        Imgproc.cvtColor(frame, lab, Imgproc.COLOR_BGR2Lab)

        val mask = Mat()
        Core.inRange(lab, LAB_LOWER, LAB_UPPER, mask)

        lab.release()
        return mask
    }

    private fun copyPcaModelToFilesDir(): File {
        val assetName = "pca_reconstruct.onnx"
        val file = File(reactApplicationContext.filesDir, assetName)
    
        reactApplicationContext.assets.open(assetName).use { input ->
            val availableBytes = input.available()
            Log.i("ONNX", "Asset size: $availableBytes bytes")
            file.outputStream().use { output ->
                input.copyTo(output)
            }
        }
    
        Log.i("ONNX", "Copied PCA model to ${file.absolutePath}, file size: ${file.length()} bytes")
        return file
    }
    
    

    private fun bitmapToMat(bitmap: Bitmap): Mat {
        val mat = Mat()
        val bmp32 = bitmap.copy(Bitmap.Config.ARGB_8888, true)
        org.opencv.android.Utils.bitmapToMat(bmp32, mat)
        return mat
    }

    private fun matToFloatArray(mat: Mat): FloatArray {
        val rows = mat.rows()
        val cols = mat.cols()
        val floatArray = FloatArray(rows * cols)
        val gray = Mat()
        if (mat.channels() == 3) {
            Imgproc.cvtColor(mat, gray, Imgproc.COLOR_BGR2GRAY)
        } else {
            mat.copyTo(gray)
        }
    
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                floatArray[r * cols + c] = gray.get(r, c)[0].toFloat()
            }
        }
        gray.release()
        return floatArray
    }
    
    private fun findCandidateRects(mask: Mat, minThresh: Double = 0.025, maxThresh: Double = 0.50): List<RotatedRect> {

        val imgArea = mask.rows() * mask.cols()
        val minArea = imgArea * minThresh
        val maxArea = imgArea * maxThresh

        // Clean mask
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(3.0, 3.0))
        val maskClean = Mat()
        Imgproc.morphologyEx(mask, maskClean, Imgproc.MORPH_OPEN, kernel, Point(-1.0, -1.0), 2)

        val contours = ArrayList<MatOfPoint>()
        Imgproc.findContours(maskClean, contours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)

        val candidates = ArrayList<RotatedRect>()

        for (cnt in contours) {

            val cnt2f = MatOfPoint2f(*cnt.toArray())
            val rect = Imgproc.minAreaRect(cnt2f)

            val size = rect.size
            val w = size.width
            val h = size.height
            val area = w * h

            if (area in minArea..maxArea)
                candidates.add(rect)
        }

        return candidates
    }

    private fun cropRotatedRect(image: Mat, rect: RotatedRect, outSize: Size = Size(144.0, 64.0)): Mat? {

        var angle = rect.angle
        var size = rect.size

        // If height > width → swap + rotate 90°
        var W = size.width
        var H = size.height

        if (H > W) {
            val tmp = W
            W = H
            H = tmp
            angle += 90
        }

        val center = rect.center

        val rotationMat = Imgproc.getRotationMatrix2D(center, angle, 1.0)

        val rotated = Mat()
        Imgproc.warpAffine(image, rotated, rotationMat, image.size())

        val x = center.x.toInt()
        val y = center.y.toInt()

        val x0 = x - (W / 2).toInt()
        val y0 = y - (H / 2).toInt()
        val x1 = x + (W / 2).toInt()
        val y1 = y + (H / 2).toInt()

        if (x0 < 0 || y0 < 0 || x1 > rotated.cols() || y1 > rotated.rows())
            return null

        val crop = rotated.submat(y0, y1, x0, x1)

        // Resize to PCA size
        val resized = Mat()
        Imgproc.resize(crop, resized, outSize)

        return resized
    }

    // --- PCA reconstruction ---
    fun reconstructPCA(input: FloatArray, mean: FloatArray, components: Array<FloatArray>): FloatArray {
        val nFeatures = mean.size
        val nComponents = components.size
    
        // x_centered = input - mean
        val xCentered = FloatArray(nFeatures) { i -> input[i] - mean[i] }
    
        // proj = x_centered @ components^T
        val proj = FloatArray(nComponents)
        for (i in 0 until nComponents) {
            proj[i] = 0f
            for (j in 0 until nFeatures) {
                proj[i] += xCentered[j] * components[i][j]
            }
        }
    
        // recon = mean + proj @ components
        val recon = FloatArray(nFeatures)
        for (i in 0 until nFeatures) {
            var sum = 0f
            for (j in 0 until nComponents) {
                sum += proj[j] * components[j][i]
            }
            recon[i] = mean[i] + sum
        }
    
       Log.i("PCA_TEMP", "Input first 5: ${input.slice(0..20).joinToString(", ")}") 
       //Log.i("PCA_TEMP", "Recon first 5: ${recon.slice(0..4).joinToString(", ")}") 
       
       //Log.i("PCA_TEMP", "Input size: ${input.size}") 
       //Log.i("PCA_TEMP", "Recon size: ${recon.size}")

        return recon
    }    

    fun reconstructionError(input: FloatArray, recon: FloatArray): Double {
        var mse = 0.0
        for (i in input.indices) {
            val diff = input[i] - recon[i]
            mse += diff * diff
        }
        return mse / input.size
    }
    


    // ====== React Methods ======

    @ReactMethod
    fun ping(message: String, promise: Promise) {
        promise.resolve("Kotlin received: $message")
    }

    @ReactMethod
    fun loadVideoFrames(path: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(path)
            val durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLong() ?: 0
            val framesToGrab = 10
            val intervalMs = durationMs / framesToGrab

            val framesArray = Arguments.createArray()

            for (i in 0 until framesToGrab) {
                val frameTimeUs = i * intervalMs * 1000  // ms → µs
                val bitmap = retriever.getFrameAtTime(
                    frameTimeUs,
                    MediaMetadataRetriever.OPTION_CLOSEST
                )

                if (bitmap != null) {

                    // Convert to Mat
                    val frameMat = bitmapToMat(bitmap)

                    // Apply LAB mask
                    val maskMat = applyLabMask(frameMat)

                    val rects = findCandidateRects(maskMat)

                    for (rect in rects) {
                        val crop = cropRotatedRect(frameMat, rect)
                        if (crop != null) {

                            val vec = matToFloatArray(crop)
                            
                            val recon = reconstructPCA(vec, pcaMean, pcaComponents)
                            val mse = reconstructionError(vec, recon)

                            Log.d("OpenCV", "Candidate MSE = $mse")

                            val bmp = Bitmap.createBitmap(crop.cols(), crop.rows(), Bitmap.Config.ARGB_8888)
                            Utils.matToBitmap(crop, bmp)

                            val stream = ByteArrayOutputStream()
                            bmp.compress(Bitmap.CompressFormat.PNG, 100, stream)
                            val b64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)

                            val obj = Arguments.createMap()
                            obj.putString("image", "data:image/png;base64,$b64")
                            obj.putDouble("error", mse)

                            framesArray.pushMap(obj)
                            
                        }
                    }
                }
            }

            retriever.release()
            promise.resolve(framesArray)
        } catch (e: Exception) {
            promise.reject("LOAD_ERROR", e)
        }
    }
}
