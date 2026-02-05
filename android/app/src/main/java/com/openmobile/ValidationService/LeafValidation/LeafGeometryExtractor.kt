package com.openmobile.ValidationService.LeafValidation

import org.opencv.core.*
import org.opencv.imgproc.Imgproc
import kotlin.math.max


data class LeafGeometry(
    val area: Double,
    val perimeter: Double,
    val compactness: Double,
    val widthProfile: DoubleArray
)

object LeafGeometryExtractor {

    fun extract(mask: Mat): LeafGeometry {

        val rows = mask.rows()
        val cols = mask.cols()

        val profile = DoubleArray(cols)
        var area = 0.0

        // --- AREA + WIDTH PROFILE ---
        for (x in 0 until cols) {
            var columnCount = 0
            for (y in 0 until rows) {
                if (mask.get(y, x)[0] > 0) {
                    columnCount++
                    area++
                }
            }
            profile[x] = columnCount.toDouble()
        }

        // --- PERIMETER ---
        val contours = mutableListOf<MatOfPoint>()
        val hierarchy = Mat()

        Imgproc.findContours(
            mask.clone(), // avoid modifying original
            contours,
            hierarchy,
            Imgproc.RETR_EXTERNAL,
            Imgproc.CHAIN_APPROX_SIMPLE
        )

        val perimeter = if (contours.isNotEmpty()) {
            val largest = contours.maxByOrNull { Imgproc.contourArea(it) }
            if (largest != null) {
                Imgproc.arcLength(MatOfPoint2f(*largest.toArray()), true)
            } else {
                0.0
            }
        } else {
            0.0
        }

        // --- COMPACTNESS ---
        // Important: allow area/perimeter = 0, but avoid NaN
        val safeArea = max(area, 1.0)
        val compactness =
            if (perimeter > 0.0) {
                (perimeter * perimeter) / (safeArea)
            } else {
                0.0
            }

        return LeafGeometry(
            area = area,
            perimeter = perimeter,
            compactness = compactness,
            widthProfile = profile
        )
    }
}
