package com.openmobile.ValidationService.ToolValidation

import org.opencv.core.Mat
import org.opencv.core.Size


data class ToolFrameResult(
    val isTool: Boolean,
    val mse: Double
)

data class ToolVideoResult(
    val label: String,
    val toolRatio: Double
)

object ToolValidation {

    // ======================
    // Preprocess
    // ======================

    fun preprocess(
        img: Mat,
        targetSize: Size = Size(144.0, 64.0)
    ): FloatArray {
        return PCAUtils.preprocess(img, targetSize)
    }

    // ======================
    // Frame classification
    // ======================

    fun classifyFrame(
        img: Mat,
        mean: FloatArray,
        components: Array<FloatArray>,
        k: Int,
        threshold: Double
    ): ToolFrameResult {

        val x = preprocess(img)
        val recon = PCAUtils.reconstruct(x, mean, components, k)
        val mse = PCAUtils.mse(x, recon)

        val isTool = mse <= threshold
        return ToolFrameResult(isTool, mse)
    }

    // ======================
    // Video classification
    // ======================

    fun classifyVideo(
        frameResults: List<ToolFrameResult>,
        majorityRatio: Double = 0.6
    ): ToolVideoResult {

        if (frameResults.isEmpty()) {
            return ToolVideoResult("Non-Tool", 0.0)
        }

        val toolCount = frameResults.count { it.isTool }
        val ratio = toolCount.toDouble() / frameResults.size

        val label =
            if (ratio >= majorityRatio) "Tool"
            else "Non-Tool"

        return ToolVideoResult(label, ratio)
    }
}
