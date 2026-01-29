package com.openmobile.ValidationService.ToolValidation

import android.content.Context
import com.openmobile.R
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.io.BufferedReader
import java.io.InputStreamReader

object PCALoader {

    /**
     * Load PCA mean from raw binary (.bin)
     */
    fun loadMean(context: Context): FloatArray {
        val inputStream = context.resources.openRawResource(R.raw.mean_android)
        val bytes = inputStream.readBytes()
        inputStream.close()

        val buffer = ByteBuffer
            .wrap(bytes)
            .order(ByteOrder.LITTLE_ENDIAN)

        val floats = FloatArray(bytes.size / 4)
        buffer.asFloatBuffer().get(floats)

        return floats
    }

    /**
     * Load PCA components from raw binary (.bin)
     *
     * @param dim original feature dimension (e.g. 144*64 = 9216)
     * @param k number of PCA components
     */
    fun loadComponents(
        context: Context,
        dim: Int,
        k: Int
    ): Array<FloatArray> {

        val inputStream = context.resources.openRawResource(R.raw.components_android)
        val bytes = inputStream.readBytes()
        inputStream.close()

        val buffer = ByteBuffer
            .wrap(bytes)
            .order(ByteOrder.LITTLE_ENDIAN)

        val flat = FloatArray(bytes.size / 4)
        buffer.asFloatBuffer().get(flat)

        require(flat.size == dim * k) {
            "PCA component size mismatch: expected ${dim * k}, got ${flat.size}"
        }

        return Array(k) { i ->
            flat.copyOfRange(i * dim, (i + 1) * dim)
        }
    }

    /**
     * Load a 1D CSV from res/raw as a FloatArray
     */
    fun load1D(context: Context): FloatArray {
        val inputStream = context.resources.openRawResource(R.raw.pca_mean_phone)
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
        val inputStream = context.resources.openRawResource(R.raw.pca_components_phone)
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
