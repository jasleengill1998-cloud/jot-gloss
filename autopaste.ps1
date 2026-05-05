# autopaste.ps1
# Watches queue\next-task.txt for changes and pastes content into the correct agent window
# AFTER verifying the file's HMAC signature and getting an explicit user confirmation.
#
# Usage: Run from C:\Users\jasle\Desktop\jot-gloss in PowerShell. Stop with Ctrl+C.
#
# Required env var: JOTGLOSS_QUEUE_SECRET (min 16 chars). Must match the value
# the watcher.cjs uses to sign next-task.txt, otherwise the task is rejected.
#
# Security notes:
#   - Without HMAC verification, a stray edit to next-task.txt (or anything that
#     ends up in the file via prompt-injection content) would be auto-pasted and
#     submitted to the connected agent. The signature ensures the content came
#     from the local watcher we trust.
#   - Submission to the agent now requires typing Y for each task. No more
#     fire-and-forget Enter presses.

# ─── CONFIG ────────────────────────────────────────────────────────────────────
$QueueFile    = "C:\Users\jasle\Desktop\jot-gloss\queue\next-task.txt"
$SigFile      = "C:\Users\jasle\Desktop\jot-gloss\queue\next-task.sig"
$LogFile      = "C:\Users\jasle\Desktop\jot-gloss\queue\log.txt"
$PollInterval = 3   # seconds between checks
$MaxBodyChars = 200000
# ───────────────────────────────────────────────────────────────────────────────

Add-Type -AssemblyName System.Windows.Forms

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] [$Level] $Message"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Ensure-QueueDir {
    $dir = Split-Path $QueueFile -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Log "Created queue directory: $dir"
    }
    if (-not (Test-Path $LogFile)) {
        New-Item -ItemType File -Path $LogFile -Force | Out-Null
    }
}

function Get-FileHash-Safe {
    param([string]$Path)
    try {
        if (Test-Path $Path) {
            return (Get-FileHash -Path $Path -Algorithm MD5).Hash
        }
    } catch { }
    return $null
}

function Get-HmacSha256Hex {
    param(
        [Parameter(Mandatory)] [string] $Content,
        [Parameter(Mandatory)] [string] $Secret
    )
    $keyBytes  = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $dataBytes = [System.Text.Encoding]::UTF8.GetBytes($Content)
    $hmac      = [System.Security.Cryptography.HMACSHA256]::new($keyBytes)
    try {
        $bytes = $hmac.ComputeHash($dataBytes)
        return ([System.BitConverter]::ToString($bytes)).Replace("-", "").ToLowerInvariant()
    } finally {
        $hmac.Dispose()
    }
}

function Test-SignatureMatches {
    param(
        [Parameter(Mandatory)] [string] $Expected,
        [Parameter(Mandatory)] [string] $Actual
    )
    if ($Expected.Length -ne $Actual.Length) { return $false }
    $diff = 0
    for ($i = 0; $i -lt $Expected.Length; $i++) {
        $diff = $diff -bor ([int][char]$Expected[$i] -bxor [int][char]$Actual[$i])
    }
    return ($diff -eq 0)
}

function Confirm-Send {
    param([string]$Target, [int]$BodyLength)
    Write-Host ""
    Write-Host "===== AUTOPASTE CONFIRMATION =====" -ForegroundColor Yellow
    Write-Host ("Target window: {0}" -f $Target) -ForegroundColor Yellow
    Write-Host ("Body length:   {0} chars" -f $BodyLength) -ForegroundColor Yellow
    Write-Host "Type Y + Enter to send, anything else to skip." -ForegroundColor Yellow
    $resp = Read-Host
    return ($resp -match '^(?i)y(es)?$')
}

function Find-TargetWindow {
    param([string]$Target)

    $patterns = @{
        "codex"   = @("Codex", "Claude")
        "chatgpt" = @("ChatGPT", "Google Chrome", "Microsoft Edge", "Firefox", "Brave")
    }

    $searchTerms = $patterns[$Target.ToLower()]
    if (-not $searchTerms) {
        Write-Log "Unknown TARGET value: '$Target'. Must be 'codex' or 'chatgpt'." "WARN"
        return $null
    }

    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);
}
"@ -ErrorAction SilentlyContinue

    $allProcesses = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -ne "" }

    foreach ($term in $searchTerms) {
        $match = $allProcesses | Where-Object { $_.MainWindowTitle -like "*$term*" } | Select-Object -First 1
        if ($match) {
            Write-Log "Found window: '$($match.MainWindowTitle)' (PID $($match.Id)) for target '$Target'"
            return $match
        }
    }

    Write-Log "No window found matching target '$Target'. Searched for: $($searchTerms -join ', ')" "WARN"
    return $null
}

function Focus-Window {
    param($Process)
    try {
        $hwnd = $Process.MainWindowHandle
        $isMinimized = [Win32]::IsIconic($hwnd)
        if ($isMinimized) {
            [Win32]::ShowWindow($hwnd, 9) | Out-Null
            Start-Sleep -Milliseconds 400
        }
        [Win32]::SetForegroundWindow($hwnd) | Out-Null
        Start-Sleep -Milliseconds 600
        return $true
    } catch {
        Write-Log "Failed to focus window: $_" "ERROR"
        return $false
    }
}

function Send-TextToWindow {
    param([string]$Text)

    $previous = [System.Windows.Forms.Clipboard]::GetText()

    try {
        [System.Windows.Forms.Clipboard]::SetText($Text)
        Start-Sleep -Milliseconds 200
        [System.Windows.Forms.SendKeys]::SendWait("^{END}")
        Start-Sleep -Milliseconds 150
        [System.Windows.Forms.SendKeys]::SendWait("^v")
        Start-Sleep -Milliseconds 400
        [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
        Start-Sleep -Milliseconds 200
        Write-Log "Text pasted and Enter sent successfully."
    } catch {
        Write-Log "SendKeys error: $_" "ERROR"
    } finally {
        try {
            if ($previous -ne "") {
                [System.Windows.Forms.Clipboard]::SetText($previous)
            } else {
                [System.Windows.Forms.Clipboard]::Clear()
            }
        } catch { }
    }
}

function Process-TaskFile {
    param([string]$Path, [string]$Secret)

    $rawContent = Get-Content -Path $Path -Raw -Encoding UTF8
    if ([string]::IsNullOrWhiteSpace($rawContent)) {
        Write-Log "Task file is empty — skipping." "WARN"
        return
    }
    if ($rawContent.Length -gt $MaxBodyChars) {
        Write-Log "Task file is too large ($($rawContent.Length) chars > $MaxBodyChars) — skipping." "ERROR"
        return
    }

    if (-not (Test-Path $SigFile)) {
        Write-Log "Missing $SigFile — refusing to paste an unsigned task." "ERROR"
        return
    }
    $expected = (Get-Content -Path $SigFile -Raw -Encoding UTF8).Trim().ToLowerInvariant()
    $actual   = Get-HmacSha256Hex -Content $rawContent -Secret $Secret
    if (-not (Test-SignatureMatches -Expected $expected -Actual $actual)) {
        Write-Log "HMAC mismatch — refusing to paste. Did the file get edited outside the watcher?" "ERROR"
        return
    }

    $lines = $rawContent -split "`r?`n"
    $firstLine = $lines[0].Trim()
    if ($firstLine -notmatch "^TARGET:\s*(\S+)$") {
        Write-Log "First line must be 'TARGET: codex' or 'TARGET: chatgpt'. Got: '$firstLine'" "ERROR"
        return
    }

    $target = $Matches[1].ToLower()
    $bodyLines = $lines | Select-Object -Skip 1
    $body = ($bodyLines -join "`n").TrimStart("`n").Trim()

    if ([string]::IsNullOrWhiteSpace($body)) {
        Write-Log "Task body is empty after stripping TARGET line — skipping." "WARN"
        return
    }

    Write-Log "Task detected. Target: '$target'. Body length: $($body.Length) chars."

    if (-not (Confirm-Send -Target $target -BodyLength $body.Length)) {
        Write-Log "User declined to send. Skipping." "INFO"
        return
    }

    $window = Find-TargetWindow -Target $target
    if (-not $window) {
        Write-Log "Cannot paste — target window not found." "ERROR"
        return
    }

    $focused = Focus-Window -Process $window
    if (-not $focused) {
        Write-Log "Cannot paste — failed to focus window." "ERROR"
        return
    }

    Send-TextToWindow -Text $body
    Write-Log "Task dispatched to '$target' window: $($window.MainWindowTitle)"
}

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────

Ensure-QueueDir

$Secret = $env:JOTGLOSS_QUEUE_SECRET
if ([string]::IsNullOrEmpty($Secret) -or $Secret.Length -lt 16) {
    Write-Log "Set JOTGLOSS_QUEUE_SECRET (min 16 chars) before running this script." "ERROR"
    exit 1
}

Write-Log "=== autopaste.ps1 started ==="
Write-Log "Watching: $QueueFile"
Write-Log "Poll interval: $PollInterval seconds"
Write-Log "Press Ctrl+C to stop."
Write-Host ""

$lastHash = Get-FileHash-Safe -Path $QueueFile
$lastModified = $null
if (Test-Path $QueueFile) {
    $lastModified = (Get-Item $QueueFile).LastWriteTime
}

try {
    while ($true) {
        Start-Sleep -Seconds $PollInterval

        if (-not (Test-Path $QueueFile)) {
            $lastHash = $null
            $lastModified = $null
            continue
        }

        $currentModified = (Get-Item $QueueFile).LastWriteTime
        $currentHash     = Get-FileHash-Safe -Path $QueueFile

        $changed = ($currentModified -ne $lastModified) -or ($currentHash -ne $lastHash -and $null -ne $lastHash)

        if ($changed) {
            Write-Log "File change detected."
            $lastHash     = $currentHash
            $lastModified = $currentModified

            try {
                Process-TaskFile -Path $QueueFile -Secret $Secret
            } catch {
                Write-Log "Unexpected error processing task: $_" "ERROR"
            }
        }

        if ($null -eq $lastHash) {
            $lastHash     = $currentHash
            $lastModified = $currentModified
        }
    }
} finally {
    Write-Log "=== autopaste.ps1 stopped ==="
}
