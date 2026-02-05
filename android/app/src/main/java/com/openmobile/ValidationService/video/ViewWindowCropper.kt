package com.openmobile.ValidationService.video
import org.opencv.core.*

object ViewWindowCropper {

    // Physical ratios
    private const val TOOL_WIDTH_IN = 8.5
    private const val TOOL_HEIGHT_IN = 4.0
    private const val WINDOW_WIDTH_IN = 6.5
    private const val WINDOW_HEIGHT_IN = 1.0

    fun crop(toolMat: Mat): Mat? {
        if (toolMat.empty()) return null

        val W = toolMat.cols()
        val H = toolMat.rows()

        // Convert physical ratios to pixels
        val windowWidthPx = (W * (WINDOW_WIDTH_IN / TOOL_WIDTH_IN)).toInt()
        val windowHeightPx = (H * (WINDOW_HEIGHT_IN / TOOL_HEIGHT_IN)).toInt()

        val x = (W - windowWidthPx) / 2
        val y = (H - windowHeightPx) / 2

        // Safety clamp
        if (x < 0 || y < 0 ||
            x + windowWidthPx > W ||
            y + windowHeightPx > H
        ) return null

        val roi = Rect(x, y, windowWidthPx, windowHeightPx)
        return Mat(toolMat, roi).clone()
    }
}
