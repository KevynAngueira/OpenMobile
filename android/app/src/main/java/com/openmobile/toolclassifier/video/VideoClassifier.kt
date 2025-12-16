package com.openmobile.toolclassifier.video

import android.util.Log
import org.opencv.core.*
import com.openmobile.toolclassifier.pca.PCAUtils

// Extract Candidates and Save imports
import java.io.File
import android.graphics.Bitmap
import java.io.FileOutputStream
import org.opencv.android.Utils
import org.opencv.imgproc.Imgproc
import org.json.JSONObject
import org.json.JSONArray


class VideoClassifier(
    private val pcaMean: FloatArray,
    private val pcaComponents: Array<FloatArray>,
    private val targetSize: Size = Size(144.0, 64.0),
    private val k: Int = 5,
    private val threshold: Double = 393.25815,
    private val majorityRatio: Double = 0.6,
    private val labLower: Scalar = Scalar(55.0, 142.0, 100.0),
    private val labUpper: Scalar = Scalar(255.0, 255.0, 136.0)
) {

    fun classify(videoPath: String, numFrames: Int = 15): Pair<String, Double> {
        
        val frames = FrameExtractor.extractEquallySpaced(videoPath, numFrames)
        
        if (frames.isEmpty()) {
            Log.e("VideoClass", "No frames extracted — returning default.")
            return "Non-Tool" to 0.0
        }

        var positives = 0

        for (frame in frames) {

            val mask = LabMask.apply(frame, labLower, labUpper)
            val rects = CandidateDetector.find(mask, 0.025, 0.5)

            var frameHit = false

            for (rect in rects) {
                val crop = RotatedCropper.crop(frame, rect) ?: continue

                val x = PCAUtils.preprocess(crop, targetSize)
                val recon = PCAUtils.reconstruct(x, pcaMean, pcaComponents, k)
                val mse = PCAUtils.mse(x, recon)

                if (mse < threshold) {
                    frameHit = true
                    break
                }
            }

            if (frameHit) positives++
        }

        val ratio = positives.toDouble() / frames.size
        val label = if (ratio >= majorityRatio) "Tool" else "Non-Tool"

        return label to ratio
    }


    // Extract Candidates and Save + Helper Functions
    fun extractCandidatesAndSave(
        videoPath: String,
        outDir: File,
        numFrames: Int = 15
    ): Int {

        val frames = FrameExtractor.extractEquallySpaced(videoPath, numFrames)

        if (frames.isEmpty()) {
            Log.e("VideoClass", "No frames extracted — nothing to save.")
            return 0
        }

        var saved = 0
        val videoName = File(videoPath).nameWithoutExtension

        for ((frameIdx, frame) in frames.withIndex()) {

            val mask = LabMask.apply(frame, labLower, labUpper)
            val rects = CandidateDetector.find(mask, 0.025, 0.5)

            for ((candIdx, rect) in rects.withIndex()) {

                val crop = RotatedCropper.crop(frame, rect) ?: continue

                val baseName =
                    "${videoName}_f${frameIdx}_c${candIdx}"

                // 1️⃣ Save image
                val imgFile = File(outDir, "$baseName.png")
                saveMatAsPNG(crop, imgFile)

                // 2️⃣ Save metadata (optional but very useful)
                val metaFile = File(outDir, "$baseName.json")
                saveCandidateMetadata(
                    videoPath,
                    frameIdx,
                    candIdx,
                    rect,
                    metaFile
                )

                saved++
            }
        }

        Log.d("VideoClass", "Saved $saved candidates to ${outDir.absolutePath}")
        return saved
    }

    private fun saveMatAsPNG(mat: Mat, file: File) {
        val rgb = Mat()
        Imgproc.cvtColor(mat, rgb, Imgproc.COLOR_BGR2RGB)
    
        val bmp = Bitmap.createBitmap(
            rgb.cols(),
            rgb.rows(),
            Bitmap.Config.ARGB_8888
        )
        Utils.matToBitmap(rgb, bmp)
    
        FileOutputStream(file).use {
            bmp.compress(Bitmap.CompressFormat.PNG, 100, it)
        }
    }

    private fun saveCandidateMetadata(
        videoPath: String,
        frameIdx: Int,
        candIdx: Int,
        rect: RotatedRect,
        file: File
    ) {
        val json = JSONObject().apply {
            put("video", File(videoPath).name)
            put("frame_index", frameIdx)
            put("candidate_index", candIdx)

            put("center", JSONArray(listOf(rect.center.x, rect.center.y)))
            put("size", JSONArray(listOf(rect.size.width, rect.size.height)))
            put("angle", rect.angle)

            val pts = Array(4) { Point() }
            rect.points(pts)

            put("corners", JSONArray(
                pts.map { JSONArray(listOf(it.x, it.y)) }
            ))
        }

        file.writeText(json.toString(2))
    }


}
