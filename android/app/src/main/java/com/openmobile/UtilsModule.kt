package com.openmobile

import android.content.ContentResolver
import android.media.MediaMetadataRetriever
import android.net.Uri
import com.facebook.react.bridge.*

class UtilsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val contentResolver: ContentResolver = reactContext.contentResolver

    override fun getName(): String {
        return "UtilsModule"
    }

    /**
     * Extracts GPS coordinates from a video file, if available.
     * videoUri: content:// or file:// URI
     */
    @ReactMethod
    fun getVideoLocation(videoUri: String, successCallback: Callback, errorCallback: Callback) {
        try {
            val uri = Uri.parse(videoUri)
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(reactApplicationContext, uri)

            // METADATA_KEY_LOCATION returns string like "+37.421998-122.084000/"
            val locationString = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_LOCATION)
            retriever.release()

            if (locationString != null) {
                // Parse the "+lat-long/" format
                val regex = """([+-][0-9.]+)([+-][0-9.]+)""".toRegex()
                val match = regex.find(locationString)

                if (match != null) {
                    val latitude = match.groupValues[1].toDouble()
                    val longitude = match.groupValues[2].toDouble()
                    val result = Arguments.createMap()
                    result.putDouble("latitude", latitude)
                    result.putDouble("longitude", longitude)
                    successCallback.invoke(result)
                    return
                }
            }

            // If no location found
            successCallback.invoke(null)
        } catch (e: Exception) {
            errorCallback.invoke(e.message)
        }
    }
}
