@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%"

echo ==========================================
echo 🚀 STARTING WINDOWS NATIVE BUILD (Bypassing EAS)
echo ==========================================

echo [Step 1/3] Preparing native android files...
call npx expo prebuild --platform android --no-install

echo [Step 2/3] Cleaning build cache...
cd android
call gradlew clean

echo [Step 3/3] Compiling Production APK...
call gradlew assembleRelease

echo ==========================================
echo ✅ DONE! Your APK will be in:
echo fetchmeup\android\app\build\outputs\apk\release\app-release.apk
echo ==========================================
pause
