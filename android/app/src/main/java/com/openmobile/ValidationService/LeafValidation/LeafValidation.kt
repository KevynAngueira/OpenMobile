package com.openmobile.ValidationService.LeafValidation

import org.opencv.core.*
import org.opencv.imgproc.Imgproc
import android.util.Log


data class LeafResult(
    val label: String,
    val score: Double
)

object LeafValidation {

    // ======================
    // Preprocess
    // ======================

    fun preprocess(
        viewWindow: Mat,
        targetSize: Size = Size(144.0, 64.0),
        labLower: Scalar = Scalar(0.0, 0.0, 124.0),
        labUpper: Scalar = Scalar(255.0, 135.0, 255.0)
    ): Mat {

        // Resize
        val resized = Mat()
        Imgproc.resize(viewWindow, resized, targetSize)

        // Convert to LAB
        val lab = Mat()
        Imgproc.cvtColor(resized, lab, Imgproc.COLOR_BGR2Lab)

        // Loose LAB mask
        val mask = Mat()
        Core.inRange(lab, labLower, labUpper, mask)

        // Morph cleanup
        val kernel = Imgproc.getStructuringElement(
            Imgproc.MORPH_RECT,
            Size(3.0, 3.0)
        )
        Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_OPEN, kernel)
        Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_CLOSE, kernel)

        return mask
    }

    // ======================
    // Classification
    // ======================

    fun classify(
        series: LeafGeometrySeries,
        weights: DoubleArray = doubleArrayOf(
            1.64573332e-6,   // area delta variance
            7.82098929e-4,   // perimeter delta variance
            1.97011566e-2    // compactness delta variance
        ),
        
        bias: Double = -2.72327012
    ): LeafResult {

        Log.d("LeafValidation", series.toString())

        val x = series.featureVector()

        var score = bias
        for (i in x.indices) {
            score += weights[i] * x[i]
        }

        val label =
            if (score > 0.0) "Traversing"
            else "Static"

        return LeafResult(label, score)
    }
}
