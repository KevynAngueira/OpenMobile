package com.openmobile.ValidationService.video

import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import org.opencv.android.Utils
import org.opencv.core.Mat

import org.opencv.videoio.Videoio
import org.opencv.imgproc.Imgproc
import org.opencv.videoio.VideoCapture

import android.util.Log

object FrameExtractor {

    fun extractEquallySpaced(videoPath: String, numFrames: Int): List<Mat> {
        val retriever = MediaMetadataRetriever()

        try {
            retriever.setDataSource(videoPath)

            val durationMs =
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLong()
                    ?: return emptyList()

            val frames = mutableListOf<Mat>()

            for (i in 0 until numFrames) {
                val t = (i * durationMs) / (numFrames - 1)

                val bmp = retriever.getFrameAtTime(
                    t * 1000,          // convert ms → us
                    MediaMetadataRetriever.OPTION_CLOSEST
                ) ?: continue

                val mat = Mat()
                val rgba = Mat()

                // Convert Bitmap → Mat(RGBA)
                Utils.bitmapToMat(bmp, rgba)

                // Convert RGBA → BGR (your pipeline requires BGR)
                Imgproc.cvtColor(rgba, mat, Imgproc.COLOR_RGBA2BGR)

                frames.add(mat)
            }

            return frames

        } catch (e: Exception) {
            Log.e("VideoClass", "Frame extraction error", e)
            return emptyList()
        } finally {
            retriever.release()
        }
    }
}
