@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo   Replant Android Release Build Script
echo ==========================================
echo.

:: 현재 시간 가져오기
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,4%

:: 프로젝트 루트 경로
set PROJECT_ROOT=%~dp0
set ANDROID_DIR=%PROJECT_ROOT%android
set APP_DIR=%ANDROID_DIR%\app
set BUILD_OUTPUT=%PROJECT_ROOT%..\builds
set APK_OUTPUT=%APP_DIR%\build\outputs\apk\release
set BUNDLE_OUTPUT=%APP_DIR%\build\outputs\bundle\release

:: Keystore 경로
set KEYSTORE_FILE=%APP_DIR%\replant-release.keystore
set KEYSTORE_BACKUP=%PROJECT_ROOT%..\replant-release.keystore
set KEYSTORE_PROPERTIES=%ANDROID_DIR%\keystore.properties

echo [0/5] Checking keystore configuration...

:: keystore.properties 확인
if not exist "%KEYSTORE_PROPERTIES%" (
    echo [ERROR] keystore.properties not found!
    echo Please create: %KEYSTORE_PROPERTIES%
    pause
    exit /b 1
)
echo [OK] keystore.properties found

:: keystore 파일 확인
if not exist "%KEYSTORE_FILE%" (
    echo [WARN] Keystore not found in android/app
    if exist "%KEYSTORE_BACKUP%" (
        echo [INFO] Copying keystore from project root...
        copy "%KEYSTORE_BACKUP%" "%KEYSTORE_FILE%"
        echo [OK] Keystore copied
    ) else (
        echo [ERROR] replant-release.keystore not found!
        echo Expected locations:
        echo   - %KEYSTORE_FILE%
        echo   - %KEYSTORE_BACKUP%
        pause
        exit /b 1
    )
) else (
    echo [OK] replant-release.keystore found
)
echo.

echo [1/5] Cleaning previous build...
cd /d "%ANDROID_DIR%"
call gradlew.bat clean
if errorlevel 1 (
    echo [ERROR] Clean failed!
    pause
    exit /b 1
)
echo [OK] Clean completed
echo.

echo [2/5] Building Release APK...
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo [ERROR] APK build failed!
    pause
    exit /b 1
)
echo [OK] APK build completed
echo.

echo [3/5] Building Release Bundle (AAB)...
call gradlew.bat bundleRelease
if errorlevel 1 (
    echo [ERROR] Bundle build failed!
    pause
    exit /b 1
)
echo [OK] Bundle build completed
echo.

echo [4/5] Copying to builds folder...

:: builds 폴더 생성
if not exist "%BUILD_OUTPUT%" mkdir "%BUILD_OUTPUT%"

:: 타임스탬프 폴더 생성
set TARGET_DIR=%BUILD_OUTPUT%\%TIMESTAMP%
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: APK 복사
if exist "%APK_OUTPUT%\*.apk" (
    for %%f in ("%APK_OUTPUT%\*.apk") do (
        copy "%%f" "%TARGET_DIR%\replant-%TIMESTAMP%.apk"
        echo [OK] APK copied: replant-%TIMESTAMP%.apk
    )
) else (
    echo [WARN] APK not found
)

:: AAB 복사
if exist "%BUNDLE_OUTPUT%\*.aab" (
    for %%f in ("%BUNDLE_OUTPUT%\*.aab") do (
        copy "%%f" "%TARGET_DIR%\replant-%TIMESTAMP%.aab"
        echo [OK] AAB copied: replant-%TIMESTAMP%.aab
    )
) else (
    echo [WARN] AAB not found
)

echo.
echo [5/5] Build Summary
echo ==========================================
echo   Build Complete!
echo ==========================================
echo.
echo Keystore: %KEYSTORE_FILE%
echo Output:   %TARGET_DIR%
echo.
dir "%TARGET_DIR%"
echo.

pause
