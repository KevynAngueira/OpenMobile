package com.openmobile.toolclassifier.pca

import com.openmobile.R
import android.content.Context
import java.io.BufferedReader
import java.io.InputStreamReader

object PCALoader {

    /**
     * Load a 1D CSV from res/raw as a FloatArray
     */
    fun load1D(context: Context): FloatArray {
        val inputStream = context.resources.openRawResource(R.raw.pca_mean)
        val reader = BufferedReader(InputStreamReader(inputStream))
        val values = mutableListOf<Float>()

        reader.useLines { lines ->
            lines.forEach { line ->
                line.split(",", ";", " ", "\t")
                    .filter { it.isNotBlank() }
                    .forEach { token ->
                        values.add(token.toFloat())
                    }
            }
        }

        return values.toFloatArray()
    }

    /**
     * Load a 2D CSV from res/raw as Array<FloatArray>
     */
    fun load2D(context: Context): Array<FloatArray> {
        val inputStream = context.resources.openRawResource(R.raw.pca_components)
        val reader = BufferedReader(InputStreamReader(inputStream))
        val rows = mutableListOf<FloatArray>()

        reader.useLines { lines ->
            lines.forEach { line ->
                if (line.isBlank()) return@forEach

                val row = line.split(",", ";", " ", "\t")
                    .filter { it.isNotBlank() }
                    .map { it.toFloat() }
                    .toFloatArray()

                rows.add(row)
            }
        }

        return rows.toTypedArray()
    }
}
