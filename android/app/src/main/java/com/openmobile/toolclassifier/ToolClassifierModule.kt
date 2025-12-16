package com.openmobile.toolclassifier

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.openmobile.toolclassifier.pca.PCALoader
import com.openmobile.toolclassifier.video.VideoClassifier
import java.util.concurrent.Executors 
import java.io.File


@ReactModule(name = ToolClassifierModule.NAME)
class ToolClassifierModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "ToolClassifier"
    }

    // ✔️ Create your own background thread pool
    private val executor = Executors.newSingleThreadExecutor()

    private val pcaMean = PCALoader.load1D(reactContext)
    private val pcaComponents = PCALoader.load2D(reactContext)
    private val classifier = VideoClassifier(pcaMean, pcaComponents)

    override fun getName(): String = NAME

    @ReactMethod
    fun classifyVideo(videoPath: String, promise: Promise) {
        executor.execute {    
            try {
                val result = classifier.classify(videoPath)
                Log.d(NAME, "Video classification result: $result")
                val map = Arguments.createMap()
                map.putString("label", result.first)
                map.putDouble("ratio", result.second)

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
}
