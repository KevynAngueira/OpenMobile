package com.openmobile

import android.content.ContentResolver
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.WritableNativeArray

class MediaStoreModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val contentResolver: ContentResolver = reactContext.contentResolver

    override fun getName(): String {
        return "MediaStoreModule"
    }

    @ReactMethod
    fun getImagesFromSnapmedia(successCallback: Callback, errorCallback: Callback) {
        try {
            val collection: Uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI

            val projection = arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DATA
            )

            val selection = "${MediaStore.Images.Media.DATA} LIKE ?"
            val selectionArgs = arrayOf("%snapmedia%")

            val cursor: Cursor? = contentResolver.query(
                collection,
                projection,
                selection,
                selectionArgs,
                null
            )

            val imagePaths = WritableNativeArray()

            cursor?.use {
                while (it.moveToNext()) {
                    val columnIndex = it.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
                    val imagePath = it.getString(columnIndex)
                    imagePaths.pushString(imagePath)
                }
            }

            successCallback.invoke(imagePaths)
        } catch (e: Exception) {
            errorCallback.invoke(e.message)
        }
    }

    @ReactMethod
    fun getVideosFromSnapmedia(successCallback: Callback, errorCallback: Callback) {
        try {
            val collection: Uri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI

            val projection = arrayOf(
                MediaStore.Video.Media._ID,
                MediaStore.Video.Media.DATA
            )

            val selection = "${MediaStore.Video.Media.DATA} LIKE ?"
            val selectionArgs = arrayOf("%snapmedia%")

            val cursor: Cursor? = contentResolver.query(
                collection,
                projection,
                selection,
                selectionArgs,
                null
            )

            val videoPaths = WritableNativeArray()

            cursor?.use {
                while (it.moveToNext()) {
                    val columnIndex = it.getColumnIndexOrThrow(MediaStore.Video.Media.DATA)
                    val videoPath = it.getString(columnIndex)
                    videoPaths.pushString(videoPath)
                }
            }

            successCallback.invoke(videoPaths)
        } catch (e: Exception) {
            errorCallback.invoke(e.message)
        }
    }
}
