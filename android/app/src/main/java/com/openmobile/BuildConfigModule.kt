package com.openmobile

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class BuildConfigModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BuildConfigModule"
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isDevMode(): Boolean {
        return BuildConfig.DEV_MODE
    }
}
