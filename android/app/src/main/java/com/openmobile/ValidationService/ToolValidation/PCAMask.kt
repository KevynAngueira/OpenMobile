package com.openmobile.ValidationService.ToolValidation

import org.opencv.core.Size

object PCAMask {

    // Physical ratios
    private const val TOOL_WIDTH_IN = 8.5
    private const val TOOL_HEIGHT_IN = 4.0
    private const val WINDOW_WIDTH_IN = 6.5
    private const val WINDOW_HEIGHT_IN = 1.0

    // Cache of precomputed masks keyed by "WIDTHxHEIGHT"
    private val maskCache = mutableMapOf<String, BooleanArray>()

    // Must match PCA resize size
    fun buildWindowMask(size: Size): BooleanArray {
        val key = "${size.width.toInt()}x${size.height.toInt()}"
        
        // Return cached if available
        maskCache[key]?.let { return it }

        // Compute new mask
        val W = size.width.toInt()
        val H = size.height.toInt()

        val windowWidthPx = (W * (WINDOW_WIDTH_IN / TOOL_WIDTH_IN)).toInt()
        val windowHeightPx = (H * (WINDOW_HEIGHT_IN / TOOL_HEIGHT_IN)).toInt()

        val x0 = (W - windowWidthPx) / 2
        val y0 = (H - windowHeightPx) / 2
        val x1 = x0 + windowWidthPx
        val y1 = y0 + windowHeightPx

        val mask = BooleanArray(W * H) { true }

        for (r in y0 until y1) {
            for (c in x0 until x1) {
                mask[r * W + c] = false // false = REMOVE
            }
        }

        // Save to cache for next time
        maskCache[key] = mask
        return mask
    }
}
