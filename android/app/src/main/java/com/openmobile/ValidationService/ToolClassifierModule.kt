package com.openmobile.ValidationService

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.openmobile.ValidationService.ToolValidation.PCALoader
import com.openmobile.ValidationService.video.VideoClassifier
import com.openmobile.ValidationService.video.VideoResult
import java.util.concurrent.Executors 

// Extract video imports
import java.io.File
import com.facebook.react.modules.core.DeviceEventManagerModule


@ReactModule(name = ToolClassifierModule.NAME)
class ToolClassifierModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "ToolClassifier"
    }

    // ✔️ Create your own background thread pool
    private val executor = Executors.newSingleThreadExecutor()

    private val pcaMean = PCALoader.loadMean(reactContext)
    private val pcaComponents = PCALoader.loadComponents(reactContext, (144 * 64), 5)
    private val classifier = VideoClassifier(reactContext, pcaMean, pcaComponents)

    override fun getName(): String = NAME

    @ReactMethod
    fun classifyVideo(videoPath: String, promise: Promise) {
        executor.execute {
            try {
                val result: VideoResult = classifier.classify(videoPath)
                Log.d(NAME, "Video classification result: $result")

                val map = Arguments.createMap()

                // ---- Tool result ----
                val toolMap = Arguments.createMap()
                toolMap.putString("label", result.toolResult.label)
                toolMap.putDouble("ratio", result.toolResult.toolRatio)
                map.putMap("tool", toolMap)

                // ---- Leaf result ----
                val leafMap = Arguments.createMap()
                leafMap.putString("label", result.leafResult.label)
                leafMap.putDouble("score", result.leafResult.score)
                map.putMap("leaf", leafMap)

                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("CLASSIFICATION_ERROR", e)
            }
        }
    }

    @ReactMethod
    fun extractCandidates(videoPath: String, promise: Promise) {
        executor.execute {
            try {
                val outDir = File(
                    reactApplicationContext.getExternalFilesDir(null),
                    "tool_candidates"
                )
                outDir.mkdirs()

                val results = classifier.extractCandidatesAndSave(
                    videoPath,
                    outDir
                )

                val map = Arguments.createMap()
                map.putInt("numCandidates", results)
                map.putString("outputDir", outDir.absolutePath)

                promise.resolve(map)

            } catch (e: Exception) {
                promise.reject("EXTRACTION_ERROR", e)
            }
        }
    }

    @ReactMethod
    fun extractCandidatesFromFolder(folderPath: String) {
        executor.execute {
            try {
                val folder = File(folderPath)
                if (!folder.exists() || !folder.isDirectory) {
                    Log.e(NAME, "Invalid folder: $folderPath")
                    return@execute
                }

                val videos = folder.listFiles { file ->
                    file.extension.lowercase() in listOf("mp4", "avi", "mov")
                }?.toList() ?: emptyList()

                val total = videos.size
                var processed = 0

                val outDir = File(
                    reactApplicationContext.getExternalFilesDir(null),
                    "tool_candidates"
                )
                outDir.mkdirs()

                for (video in videos) {
                    classifier.extractCandidatesAndSave(video.absolutePath, outDir)
                    processed++

                    val progress = Arguments.createMap().apply {
                        putInt("processed", processed)
                        putInt("total", total)
                        putString("current", video.name)
                    }

                    sendProgressEvent("ToolCandidateProgress", progress)
                }

                val done = Arguments.createMap().apply {
                    putInt("totalVideos", total)
                    putString("outputDir", outDir.absolutePath)
                }

                sendProgressEvent("ToolCandidateDone", done)

            } catch (e: Exception) {
                Log.e(NAME, "Batch extraction failed", e)
            }
        }
    }

    private fun sendProgressEvent(
        eventName: String,
        params: WritableMap
    ) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

}
