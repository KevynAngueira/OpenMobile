package com.openmobile.ValidationService.Utils

import java.io.DataInputStream
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder

object BinLoader {

    fun load1D(path: String): DoubleArray {
        DataInputStream(FileInputStream(path)).use { dis ->
            val n = dis.readInt()
            return DoubleArray(n) { dis.readDouble() }
        }
    }

    fun load2D(path: String): Array<DoubleArray> {
        DataInputStream(FileInputStream(path)).use { dis ->
            val rows = dis.readInt()
            val cols = dis.readInt()
            return Array(rows) {
                DoubleArray(cols) { dis.readDouble() }
            }
        }
    }

    fun loadFrame(path: String): DoubleArray {
        DataInputStream(FileInputStream(path)).use { dis ->
            val n = dis.readInt()
            return DoubleArray(n) { dis.readDouble() }
        }
    }
}
