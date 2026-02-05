package com.openmobile.ValidationService.LeafValidation

import org.opencv.core.Mat
import android.util.Log

class LeafGeometrySeries {

    private val frames = mutableListOf<LeafGeometry>()

    /** Feed a new frame mask */
    fun addFrame(mask: Mat) {
        val geom = LeafGeometryExtractor.extract(mask)
        frames.add(geom)
    }

    fun size(): Int = frames.size

    fun clear() {
        frames.clear()
    }

    override fun toString(): String {
        if (frames.isEmpty()) return "LeafGeometrySeries(empty)"

        val sb = StringBuilder()
        sb.append("LeafGeometrySeries(size=${frames.size})\n")

        frames.forEachIndexed { i, g ->
            sb.append(
                "[$i] area=${g.area}, " +
                "perimeter=${g.perimeter}, " +
                "compactness=${g.compactness}\n"
            )
        }

        return sb.toString()
    }

    // ---------------------------
    // Delta variance calculations
    // ---------------------------

    fun areaDeltaVariance(): Double =
        varianceOfDeltas(frames.map { it.area })

    fun perimeterDeltaVariance(): Double =
        varianceOfDeltas(frames.map { it.perimeter })

    fun compactnessDeltaVariance(): Double =
        varianceOfDeltas(frames.map { it.compactness })

    /** Convenience for your 3D linear classifier */
    fun featureVector(): DoubleArray {
        return doubleArrayOf(
            areaDeltaVariance(),
            perimeterDeltaVariance(),
            compactnessDeltaVariance()
        )
    }

    // ---------------------------
    // Internal helpers
    // ---------------------------

    private fun varianceOfDeltas(values: List<Double>): Double {
        if (values.size < 2) return 0.0

        val deltas = DoubleArray(values.size - 1)
        for (i in 1 until values.size) {
            deltas[i - 1] = kotlin.math.abs(values[i] - values[i - 1])
        }

        return deltas.variance()
    }

    fun DoubleArray.variance(): Double {
        if (isEmpty()) return 0.0
    
        val mean = average()
        var sumSq = 0.0
        for (v in this) {
            val d = v - mean
            sumSq += d * d
        }
        return sumSq / size
    }
    
}
