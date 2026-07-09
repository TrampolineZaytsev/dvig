# Replace Sberbank icon with DVIG logo in present.pptx
$ErrorActionPreference = "Stop"
$Pptx = "E:\DVIG\present.pptx"
$Logo = "E:\DVIG\public\dvig-logo.png"
$Pdf = "E:\DVIG\present.pdf"

if (-not (Test-Path $Logo)) { throw "Logo not found: $Logo" }

Get-Process POWERPNT -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = 1
$msoFalse = 0
$pres = $pp.Presentations.Open($Pptx, $msoFalse, $msoFalse, $msoTrue)
Start-Sleep -Seconds 2

$replaced = 0
for ($si = 1; $si -le $pres.Slides.Count; $si++) {
    $slide = $pres.Slides.Item($si)
    Replace-LogoOnShapes $slide.Shapes $slide $Logo ([ref]$replaced)
}

function Replace-LogoOnShapes($shapes, $slide, $logoPath, [ref]$count) {
    for ($i = 1; $i -le $shapes.Count; $i++) {
        $sh = $shapes.Item($i)
        if ($sh.Type -eq 6) {
            Replace-LogoOnShapes $sh.GroupItems $slide $logoPath ([ref]$count)
            continue
        }
        if ($sh.Type -ne 13) { continue }  # msoPicture = 13

        $isSber = Test-SberLogo $sh
        if (-not $isSber) { continue }

        $left = $sh.Left
        $top = $sh.Top
        $w = $sh.Width
        $h = $sh.Height
        $z = $sh.ZOrderPosition
        $sh.Delete()
        $pic = $slide.Shapes.AddPicture($logoPath, $msoFalse, $msoTrue, $left, $top, $w, $h)
        $pic.ZOrder(0)  # bring to front if needed
        $count.Value++
        Write-Host "Slide: replaced picture at ($left, $top)"
    }
}

function Test-SberLogo($sh) {
    # Heuristic: small-ish logo in corner OR filename contains sber
    try {
        $alt = $sh.AlternativeText
        if ($alt -match 'sber|сбер') { return $true }
    } catch {}
    # Size heuristic: logo icons typically < 1.5 inch
    $maxSide = [Math]::Max($sh.Width, $sh.Height)
    if ($maxSide -gt 1200000) { return $false }  # ~1.3 inch in EMU
    # Position: top-left quadrant
    if ($sh.Left -lt 2500000 -and $sh.Top -lt 2000000) { return $true }
    return $false
}

Write-Host "Replaced $replaced picture(s)"
$pres.Save()
try {
    $pres.SaveAs($Pdf, 32)
    Write-Host "OK: $Pdf"
} catch {
    Write-Warning "PDF: $_"
}
Write-Host "OK: $Pptx"
# keep open
