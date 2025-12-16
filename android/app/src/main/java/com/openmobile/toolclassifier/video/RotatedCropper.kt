package com.openmobile.toolclassifier.video

import org.opencv.core.*
import org.opencv.imgproc.Imgproc

object RotatedCropper {

    fun crop(image: Mat, rect: RotatedRect): Mat? {
        var width = rect.size.width
        var height = rect.size.height
        var angle = rect.angle
        val center = rect.center

        if (height > width) {
            val tmp = width
            width = height
            height = tmp
            angle += 90.0
        }

        val M = Imgproc.getRotationMatrix2D(center, angle, 1.0)
        val rotated = Mat()
        Imgproc.warpAffine(image, rotated, M, image.size())

        val x1 = (center.x - width / 2).toInt().coerceAtLeast(0)
        val y1 = (center.y - height / 2).toInt().coerceAtLeast(0)
        val x2 = (center.x + width / 2).toInt().coerceAtMost(rotated.cols())
        val y2 = (center.y + height / 2).toInt().coerceAtMost(rotated.rows())

        if (x2 <= x1 || y2 <= y1) return null

        return rotated.submat(y1, y2, x1, x2).clone()
    }
}
