package com.openmobile.ValidationService.ToolValidation

import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc
import kotlin.math.max
import kotlin.math.min

object PCAUtils {

    fun preprocess(img: Mat, size: Size): FloatArray {
        val gray = Mat()
        Imgproc.cvtColor(img, gray, Imgproc.COLOR_BGR2GRAY)

        val resized = Mat()
        Imgproc.resize(gray, resized, size)

        val flat = FloatArray(resized.rows() * resized.cols())
        for (r in 0 until resized.rows()) {
            for (c in 0 until resized.cols()) {
                flat[r * resized.cols() + c] = resized.get(r, c)[0].toFloat()
            }
        }
        return flat
    }

    fun reconstruct(input: FloatArray, mean: FloatArray, comp: Array<FloatArray>, k: Int): FloatArray {
        val nFeatures = mean.size
        val kUsed = k.coerceAtMost(comp.size)

        val centered = FloatArray(nFeatures)
        for (i in 0 until nFeatures) centered[i] = input[i] - mean[i]

        val proj = FloatArray(kUsed)
        for (i in 0 until kUsed) {
            for (j in 0 until nFeatures) {
                proj[i] += centered[j] * comp[i][j]
            }
        }

        val recon = FloatArray(nFeatures)
        for (i in 0 until nFeatures) {
            var sum = 0f
            for (j in 0 until kUsed) sum += proj[j] * comp[j][i]
            recon[i] = mean[i] + sum
        }

        return recon
    }

    fun mse(a: FloatArray, b: FloatArray): Double {
        var sum = 0.0
        for (i in a.indices) {
            val d = a[i] - b[i]
            sum += d * d
        }
        return sum / a.size
    }
}
