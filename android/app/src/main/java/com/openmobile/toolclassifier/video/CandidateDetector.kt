package com.openmobile.toolclassifier.video

import org.opencv.core.*
import org.opencv.imgproc.Imgproc

object CandidateDetector {

    fun find(mask: Mat, minPerc: Double, maxPerc: Double): List<RotatedRect> {
        val imgArea = mask.rows() * mask.cols()
        val minArea = imgArea * minPerc
        val maxArea = imgArea * maxPerc

        val contours = mutableListOf<MatOfPoint>()
        val hierarchy = Mat()
        Imgproc.findContours(mask, contours, hierarchy,
            Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)

        val found = mutableListOf<RotatedRect>()

        for (cnt in contours) {
            val rect = Imgproc.minAreaRect(MatOfPoint2f(*cnt.toArray()))
            val area = rect.size.width * rect.size.height
            if (area in minArea..maxArea) {
                found.add(rect)
            }
        }

        return found
    }
}
