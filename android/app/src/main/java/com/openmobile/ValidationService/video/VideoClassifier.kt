package com.openmobile.ValidationService.video

import android.util.Log
import org.opencv.core.*
import com.openmobile.ValidationService.ToolValidation.*
import com.openmobile.ValidationService.LeafValidation.*
import com.facebook.react.bridge.ReactApplicationContext



// Extract Candidates and Save imports
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.io.FileOutputStream
import android.graphics.Bitmap

import org.opencv.android.Utils
import org.opencv.imgproc.Imgproc
import org.json.JSONObject
import org.json.JSONArray


data class VideoResult(
    val toolResult: ToolVideoResult,
    val leafResult: LeafResult
)

class VideoClassifier(
    private val context: ReactApplicationContext, // REMOVE LATER
    private val pcaMean: FloatArray,
    private val pcaComponents: Array<FloatArray>,
    private val targetSize: Size = Size(144.0, 64.0),
    private val k: Int = 5,
    private val threshold: Double = 500.0,
    private val majorityRatio: Double = 0.6,
    private val labLower: Scalar = Scalar(55.0, 142.0, 100.0),
    private val labUpper: Scalar = Scalar(255.0, 255.0, 136.0)
) {
    
    fun classify(videoPath: String, numFrames: Int = 15): VideoResult {
    
        val frames = FrameExtractor.extractEquallySpaced(videoPath, numFrames)
        if (frames.isEmpty()) {
            return VideoResult(
                toolResult = ToolVideoResult("Non-Tool", 0.0),
                leafResult = LeafResult("Static", 0.0)
            )
        }        
    
        // COLLECT ACROSS ENTIRE VIDEO
        val leafSeries = LeafGeometrySeries()
        val toolFrameResults = mutableListOf<ToolFrameResult>()
    
        for (frame in frames) {
    
            val mask = LabMask.apply(frame, labLower, labUpper)
            val rects = CandidateDetector.find(mask, 0.025, 0.5)
    
            var foundToolThisFrame = false
           
    
            for (rect in rects) {
                val crop = RotatedCropper.crop(frame, rect) ?: continue
    
                // ---- TOOL CHECK ----
                val toolRes = ToolValidation.classifyFrame(crop, pcaMean, pcaComponents, k, threshold)
                toolFrameResults.add(toolRes)

                if (!toolRes.isTool) continue

                // TOOL CONFIRMED
                val viewWindow = ViewWindowCropper.crop(crop) ?: continue

                // ---- LEAF PREPROCESS ----
                val leafMask = LeafValidation.preprocess(viewWindow)
                leafSeries.addFrame(leafMask)

                break // only one tool per frame
            }
        }
    
        // ---- TOOL PRESENCE DECISION ----
        val toolVideoResult = ToolValidation.classifyVideo(toolFrameResults)

        // ---- LEAF TRAVERSAL DECISION ----
        val leafResult = LeafValidation.classify(leafSeries)

        val videoResult = VideoResult(toolVideoResult, leafResult)


        // TEMP CODE || DELETA AFTER USE {

        /*

        if ((toolVideoResult.label == "Tool") && (leafResult.label != "Traversing")) {
            Log.d("FailValidation", "+++++++++++++++++++++")
            Log.d("FailValidation", videoPath)
            Log.d("FailValidation", "---------------------")
            Log.d("FailValidation", leafSeries.toString())
            Log.d("FailValidation", "---------------------")
            Log.d("FailValidation", leafSeries.featureVector().contentToString())
            Log.d("FailValidation", "+++++++++++++++++++++")

            val outDir = File(
                context.getExternalFilesDir(null),
                "snapmedia/videos"
            )

            extractCandidatesAndSave(videoPath, outDir, 15)
            
        }
        */
        
        return videoResult
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

        val toolDir = File(outDir, "Tool").apply { mkdirs() }
        val toolArrDir = File(outDir, "Tool_Arr").apply { mkdirs() }
        val leafDir = File(outDir, "Leaf").apply { mkdirs() }

        var saved = 0
        val videoName = File(videoPath).nameWithoutExtension
    
        // COLLECT ACROSS ENTIRE VIDEO
        val leafSeries = LeafGeometrySeries()
        val toolFrameResults = mutableListOf<ToolFrameResult>()
    
        for ((frameIdx, frame) in frames.withIndex()) {
    
            val mask = LabMask.apply(frame, labLower, labUpper)
            val rects = CandidateDetector.find(mask, 0.025, 0.5)           
    
            for ((candIdx, rect) in rects.withIndex()) {
                val crop = RotatedCropper.crop(frame, rect) ?: continue
    
                // ---- SAVE TOOL IMG ----
                val toolImg = crop

                val toolBaseName = "Tool_${videoName}_f${frameIdx}_c${candIdx}"
               
                val toolFile = File(toolDir, "$toolBaseName.png")
                saveMatAsPNG(toolImg, toolFile)

                // ---- SAVE TOOL ARR ----
                val toolArr = ToolValidation.preprocess(crop)

                val toolArrBaseName = "ToolArr_${videoName}_f${frameIdx}_c${candIdx}"
                
                val toolArrFile = File(toolArrDir, "$toolArrBaseName.bin")
                saveFloatArray(toolArr, toolArrFile)
                
                // ---- SAVE LEAF IMG ----

                val viewWindow = ViewWindowCropper.crop(crop) ?: continue
                val leafImg = LeafValidation.preprocess(viewWindow)

                val leafBaseName = "Leaf_${videoName}_f${frameIdx}_c${candIdx}"
                
                val leafFile = File(leafDir, "$leafBaseName.png")
                saveMatAsPNG(leafImg, leafFile)

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

    fun saveFloatArray(array: FloatArray, file: File) {
        val buffer = ByteBuffer
            .allocate(array.size * 4)
            .order(ByteOrder.LITTLE_ENDIAN)
    
        for (v in array) {
            buffer.putFloat(v)
        }
    
        FileOutputStream(file).use {
            it.write(buffer.array())
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
