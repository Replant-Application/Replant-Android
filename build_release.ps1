# Replant Android Release Build Script (PowerShell)
# Usage: .\build_release.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Replant Android Release Build Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 경로 설정
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AndroidDir = Join-Path $ProjectRoot "android"
$AppDir = Join-Path $AndroidDir "app"
$BuildOutput = Join-Path (Split-Path -Parent $ProjectRoot) "builds"
$ApkOutput = Join-Path $AppDir "build\outputs\apk\release"
$BundleOutput = Join-Path $AppDir "build\outputs\bundle\release"

# Keystore 경로
$KeystoreFile = Join-Path $AppDir "replant-release.keystore"
$KeystoreBackup = Join-Path (Split-Path -Parent $ProjectRoot) "replant-release.keystore"
$KeystoreProperties = Join-Path $AndroidDir "keystore.properties"

# 타임스탬프
$Timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$TargetDir = Join-Path $BuildOutput $Timestamp

Write-Host "[0/5] Checking keystore configuration..." -ForegroundColor Yellow

# keystore.properties 확인
if (-not (Test-Path $KeystoreProperties)) {
    Write-Host "[ERROR] keystore.properties not found!" -ForegroundColor Red
    Write-Host "Please create: $KeystoreProperties" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] keystore.properties found" -ForegroundColor Green

# keystore 파일 확인
if (-not (Test-Path $KeystoreFile)) {
    Write-Host "[WARN] Keystore not found in android/app" -ForegroundColor Yellow
    if (Test-Path $KeystoreBackup) {
        Write-Host "[INFO] Copying keystore from project root..." -ForegroundColor Cyan
        Copy-Item $KeystoreBackup $KeystoreFile
        Write-Host "[OK] Keystore copied" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] replant-release.keystore not found!" -ForegroundColor Red
        Write-Host "Expected locations:" -ForegroundColor Red
        Write-Host "  - $KeystoreFile" -ForegroundColor Red
        Write-Host "  - $KeystoreBackup" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] replant-release.keystore found" -ForegroundColor Green
}
Write-Host ""

Write-Host "[1/5] Cleaning previous build..." -ForegroundColor Yellow
Set-Location $AndroidDir
& .\gradlew.bat clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Clean failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Clean completed" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Building Release APK..." -ForegroundColor Yellow
& .\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] APK build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] APK build completed" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Building Release Bundle (AAB)..." -ForegroundColor Yellow
& .\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Bundle build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Bundle build completed" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Copying to builds folder..." -ForegroundColor Yellow

# builds 폴더 생성
if (-not (Test-Path $BuildOutput)) {
    New-Item -ItemType Directory -Path $BuildOutput | Out-Null
}

# 타임스탬프 폴더 생성
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
}

# APK 복사
$ApkFiles = Get-ChildItem -Path $ApkOutput -Filter "*.apk" -ErrorAction SilentlyContinue
if ($ApkFiles) {
    $TargetApk = Join-Path $TargetDir "replant-$Timestamp.apk"
    Copy-Item $ApkFiles[0].FullName $TargetApk
    Write-Host "[OK] APK copied: replant-$Timestamp.apk" -ForegroundColor Green
} else {
    Write-Host "[WARN] APK not found" -ForegroundColor Yellow
}

# AAB 복사
$AabFiles = Get-ChildItem -Path $BundleOutput -Filter "*.aab" -ErrorAction SilentlyContinue
if ($AabFiles) {
    $TargetAab = Join-Path $TargetDir "replant-$Timestamp.aab"
    Copy-Item $AabFiles[0].FullName $TargetAab
    Write-Host "[OK] AAB copied: replant-$Timestamp.aab" -ForegroundColor Green
} else {
    Write-Host "[WARN] AAB not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/5] Build Summary" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Build Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keystore: $KeystoreFile" -ForegroundColor White
Write-Host "Output:   $TargetDir" -ForegroundColor White
Write-Host ""
Get-ChildItem $TargetDir | Format-Table Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}} -AutoSize
