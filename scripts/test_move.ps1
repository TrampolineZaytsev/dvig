Copy-Item "E:\DVIG\Purple Black Modern Marketing Plan Presentation (2).pptx" "E:\DVIG\test_move.pptx" -Force
$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = 1
$pres = $pp.Presentations.Open("E:\DVIG\test_move.pptx")
Write-Host "open ok" $pres.Slides.Count
$pres.Slides.Item(2).Duplicate() | Out-Null
Write-Host "dup ok" $pres.Slides.Count
$pres.Slides.Item(3).MoveTo($pres.Slides.Count)
Write-Host "move ok" $pres.Slides.Count
$pres.Close()
$pp.Quit()
