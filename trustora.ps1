param(
    [Parameter(Position = 0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $RootDir ".venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$FrontendDir = Join-Path $RootDir "frontend"
$EnvPath = Join-Path $RootDir ".env"
$EnvExamplePath = Join-Path $RootDir ".env.example"
$DatasetPath = Join-Path $RootDir "csv\sms_spam_indo.csv"
$ModelPath = Join-Path $RootDir "backend\artifacts\model.joblib"

function Write-Info {
    param([string]$Message)
    Write-Host "[trustora] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[trustora] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[trustora] WARNING: $Message" -ForegroundColor Yellow
}

function Assert-Command {
    param(
        [string]$Name,
        [string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name tidak ditemukan. $InstallHint"
    }
}

function Get-ExecutablePath {
    param(
        [string]$Name,
        [string]$FallbackName = $Name
    )

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $fallback = Get-Command $FallbackName -ErrorAction SilentlyContinue
    if ($fallback) {
        return $fallback.Source
    }

    throw "$Name tidak ditemukan."
}

function Invoke-Native {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$FailureMessage
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw $FailureMessage
    }
}

function Convert-ToProcessArgument {
    param([string]$Value)

    if ($Value -notmatch '[\s"]') {
        return $Value
    }

    return '"' + ($Value -replace '"', '\"') + '"'
}

function Ensure-EnvFile {
    if (-not (Test-Path $EnvPath)) {
        if (Test-Path $EnvExamplePath) {
            Copy-Item -LiteralPath $EnvExamplePath -Destination $EnvPath
            Write-Ok "Membuat .env dari .env.example."
        }
        else {
            New-Item -ItemType File -Path $EnvPath | Out-Null
            Write-Ok "Membuat .env kosong."
        }
    }

    $content = Get-Content -LiteralPath $EnvPath -Raw
    if ($null -eq $content) {
        $content = ""
    }

    $lines = @()
    $hasDataset = $false
    foreach ($line in ($content -split "`r?`n")) {
        if ($line -match "^\s*DATASET_PATH\s*=") {
            $lines += "DATASET_PATH=csv/sms_spam_indo.csv"
            $hasDataset = $true
        }
        elseif ($line.Trim().Length -gt 0) {
            $lines += $line
        }
    }

    if (-not $hasDataset) {
        $lines = @("DATASET_PATH=csv/sms_spam_indo.csv") + $lines
    }

    Set-Content -LiteralPath $EnvPath -Value ($lines -join [Environment]::NewLine) -Encoding UTF8
    Write-Ok "Memastikan DATASET_PATH=csv/sms_spam_indo.csv di .env."

    if (-not (Test-Path $DatasetPath)) {
        Write-Warn "Dataset csv\sms_spam_indo.csv belum ada. Command 'trustora train' akan gagal sampai dataset tersedia."
    }
}

function Set-TrustoraEnvironment {
    Ensure-EnvFile

    foreach ($line in (Get-Content -LiteralPath $EnvPath)) {
        if ($line -match "^\s*#" -or -not $line.Contains("=")) {
            continue
        }

        $key, $value = $line.Split("=", 2)
        $key = $key.Trim()
        $value = $value.Trim()
        if ($key) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

function Ensure-Venv {
    Assert-Command "python" "Install Python 3.10+ dan pastikan masuk PATH."

    if (-not (Test-Path $PythonExe)) {
        Write-Info "Membuat virtual environment .venv..."
        Push-Location $RootDir
        try {
            python -m venv .venv
        }
        finally {
            Pop-Location
        }
    }
    else {
        Write-Ok "Virtual environment .venv sudah tersedia."
    }
}

function Install-Trustora {
    Assert-Command "node" "Install Node.js dan pastikan masuk PATH."
    $npmExe = Get-ExecutablePath "npm.cmd" "npm"
    Set-TrustoraEnvironment
    Ensure-Venv

    Write-Info "Meng-upgrade pip..."
    Invoke-Native $PythonExe @("-m", "pip", "install", "--upgrade", "pip") "Upgrade pip gagal."

    Write-Info "Meng-install dependency backend..."
    Invoke-Native $PythonExe @("-m", "pip", "install", "-r", (Join-Path $RootDir "backend\requirements.txt")) "Install dependency backend gagal."

    Write-Info "Meng-install dependency frontend..."
    Push-Location $FrontendDir
    try {
        Invoke-Native $npmExe @("install") "Install dependency frontend gagal."
    }
    finally {
        Pop-Location
    }

    Write-Ok "Install selesai. Jalankan 'trustora train' untuk membuat model, lalu 'trustora serve' untuk menjalankan aplikasi."
}

function Train-Trustora {
    Set-TrustoraEnvironment
    Ensure-Venv

    Write-Info "Menjalankan training model..."
    Push-Location $RootDir
    try {
        Invoke-Native $PythonExe @("-m", "backend.app.ml.train") "Training model gagal."
    }
    finally {
        Pop-Location
    }
}

function Start-PrefixedProcess {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$WorkingDirectory
    )

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $FilePath
    $startInfo.Arguments = ($Arguments | ForEach-Object { Convert-ToProcessArgument $_ }) -join " "
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $process.EnableRaisingEvents = $true

    $outputAction = {
        if ($EventArgs.Data) {
            Write-Host "[$($Event.MessageData)] $($EventArgs.Data)"
        }
    }

    [void](Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputAction -MessageData $Name)
    [void](Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $outputAction -MessageData $Name)

    [void]$process.Start()
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    return $process
}

function Serve-Trustora {
    Set-TrustoraEnvironment
    Ensure-Venv
    $npmExe = Get-ExecutablePath "npm.cmd" "npm"

    if (-not (Test-Path $ModelPath)) {
        Write-Warn "Model belum tersedia di backend\artifacts\model.joblib. Jalankan 'trustora train' agar endpoint prediksi siap."
    }

    Write-Info "Menjalankan backend dan frontend. Tekan Ctrl+C untuk berhenti."
    $backend = Start-PrefixedProcess -Name "backend" -FilePath $PythonExe -Arguments @("-m", "uvicorn", "backend.app.main:app", "--reload") -WorkingDirectory $RootDir
    $frontend = Start-PrefixedProcess -Name "frontend" -FilePath $npmExe -Arguments @("run", "dev") -WorkingDirectory $FrontendDir

    try {
        while (-not $backend.HasExited -and -not $frontend.HasExited) {
            Start-Sleep -Milliseconds 500
        }
    }
    finally {
        foreach ($process in @($backend, $frontend)) {
            if ($process -and -not $process.HasExited) {
                $process.Kill($true)
                $process.WaitForExit()
            }
        }
        Get-EventSubscriber | Where-Object { $_.SourceObject -in @($backend, $frontend) } | Unregister-Event
        Write-Info "Server dihentikan."
    }

    if ($backend.ExitCode -ne 0 -or $frontend.ExitCode -ne 0) {
        exit 1
    }
}

function Test-Trustora {
    Set-TrustoraEnvironment
    Ensure-Venv
    Write-Info "Menjalankan backend tests..."
    Push-Location $RootDir
    try {
        Invoke-Native $PythonExe @("-m", "pytest", "backend/tests") "Backend tests gagal."
    }
    finally {
        Pop-Location
    }

    Write-Info "Menjalankan frontend tests..."
    $npmExe = Get-ExecutablePath "npm.cmd" "npm"
    Push-Location $FrontendDir
    try {
        Invoke-Native $npmExe @("run", "test") "Frontend tests gagal."
        Invoke-Native $npmExe @("run", "typecheck") "Frontend typecheck gagal."
    }
    finally {
        Pop-Location
    }
}

function Show-Help {
    Write-Host "Trustora CLI"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  trustora install   Setup .venv, pip requirements, npm install, dan .env"
    Write-Host "  trustora train     Training model dan menulis backend/artifacts"
    Write-Host "  trustora serve     Jalankan backend FastAPI dan frontend Vite sekaligus"
    Write-Host "  trustora test      Jalankan pytest backend, Vitest, dan typecheck frontend"
    Write-Host "  trustora help      Tampilkan bantuan"
}

switch ($Command.ToLowerInvariant()) {
    "install" { Install-Trustora }
    "train" { Train-Trustora }
    "serve" { Serve-Trustora }
    "test" { Test-Trustora }
    "help" { Show-Help }
    default {
        Write-Warn "Command '$Command' tidak dikenal."
        Show-Help
        exit 1
    }
}
