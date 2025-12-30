package com.openmobile.ValidationService.LeafValidation

object WidthProfileDistance {

    fun l2(a: DoubleArray, b: DoubleArray): Double {
        var sum = 0.0
        for (i in a.indices) {
            val d = a[i] - b[i]
            sum += d * d
        }
        return Math.sqrt(sum)
    }
}
