package com.openmobile.toolclassifier.util

import java.io.File

object CsvLoader {

    fun load1D(path: String): FloatArray =
        File(path).readLines().map { it.toFloat() }.toFloatArray()

    fun load2D(path: String): Array<FloatArray> =
        File(path).readLines().map { line ->
            line.split(",").map { it.toFloat() }.toFloatArray()
        }.toTypedArray()
}
