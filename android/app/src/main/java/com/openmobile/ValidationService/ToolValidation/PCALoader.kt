package com.openmobile.ValidationService.ToolValidation

import android.content.Context
import com.openmobile.R
import java.nio.ByteBuffer
import java.nio.ByteOrder

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
}
