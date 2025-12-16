package com.openmobile.toolclassifier.video

import org.opencv.core.*
import org.opencv.imgproc.Imgproc

object LabMask {

    fun apply(frame: Mat, lower: Scalar, upper: Scalar): Mat {
        val lab = Mat()
        Imgproc.cvtColor(frame, lab, Imgproc.COLOR_BGR2Lab)

        val mask = Mat()
        Core.inRange(lab, lower, upper, mask)

        // clean noise
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(3.0, 3.0))
        Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_OPEN, kernel)
        Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_CLOSE, kernel)

        return mask
    }
}
