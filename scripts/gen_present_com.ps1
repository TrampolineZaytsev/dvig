# Build present.pptx via PowerPoint COM (preserves template media)
$ErrorActionPreference = "Stop"
$Root = "E:\DVIG"
$Template = Join-Path $Root "Purple Black Modern Marketing Plan Presentation (2).pptx"
$Pptx = Join-Path $Root "present.pptx"
$Pdf = Join-Path $Root "present.pdf"
$Site = "http://localhost:3000"
$Work = Join-Path $Root "present_build.pptx"

$dupOrder = @(1, 2, 2, 5, 6, 3, 5, 6, 2, 7, 6, 1)
$fillers = @("title", "two", "two", "arch", "quad", "feat", "arch", "quad", "two", "traction", "quad", "title")

$slides = @(
    @{ title = "ДВИГ"; sub = "Компания на событие"; tag = "Зайцев · Журавлёв · Полина · Соня · Настя"; foot = "Дело → люди → офлайн"; url = $Site },
    @{
        title = "Проблема"; sub = "афиша есть — компании нет"; tag = "наблюдения · СПб"; foot = "Манеж · «Этажи» · «Родина»"
        left = "Пятница: в stories все в компаниях — в кино одному некомфортно."
        right = "Манеж: три времени в афише.`n«Этажи»: пять вкладок.`n«Родина»: сайт ≠ stories."
    },
    @{
        title = "Инсайт"; sub = "ось «общение»"; tag = "из метаисследования"; foot = "не каталог id событий"
        left = "Досуг — совместное действие и доверие."
        right = "Решение в чате и голосом.`nАфиша — повод для разговора."
    },
    @{
        title = "Решение"; sub = "ДВИГ + spb-events"; tag = "взлом нормы"
        body = "ДВИГ: группа 5–15 → офлайн. Не dating.`nspb-events: KudaGo · LLM · Telegram.`nДемо: $Site/app"
    },
    @{
        title = "Рынок"; sub = "TAM / SAM / SOM"; tag = "слайд ≥ 1:30"; foot = "B2B2C-пилот · без выручки"
        q = @("TAM`nгородской досуг", "SAM`n18–28 · СПб/МСК", "SOM`n1–2 медиа/чата", "Платит`nорганизатор")
        left = "Dating — свайпы. Афиши — «куда», не «с кем»."
        right = "Ниша: повод + компания.`nПилот → freemium + комиссии."
    },
    @{
        title = "Продукт"; sub = "MVP · 8 команд CLI"; tag = "веб-демо Next.js"; url = "$Site/app"
        feats = @("search", "info", "analyze", "export", "share", "trending", "prices", "config")
        body = "Афиша KudaGo · мок групп и safety"
    },
    @{
        title = "Доверие"; sub = "алгоритм ≠ доверие"; tag = "факт / ИИ / человек"
        body = "Факт — KudaGo. Смысл — LLM с маркировкой.`nshare — решение редактора.`nОшибка модели ≠ ложь площадки."
    },
    @{
        title = "Монетизация"; sub = "не берём за общение"; tag = "платит посредник"; foot = "честная реклама"
        q = @("Freemium`nстарт бесплатно", "Комиссии`nбилеты", "Размещение`nплощадкам", "Пилот`nбез выручки")
    },
    @{
        title = "Конкуренты"; sub = "ниша между dating и афишей"; tag = "KudaGo = данные"; foot = "не дублируем агрегатор"
        left = "Dating — стресс и витрина анкет. VK/Telegram — не новые связи в реале."
        right = "Timepad, Meetup — без социального слоя. Мы: дело + люди + данные."
    },
    @{
        title = "Трекция"; sub = "сделано и пилот"; tag = "метаисследование"; foot = "доверие важнее CTR"
        q = @("6 записей`nдневника", "spb-events`nCLI MVP", "Веб-демо`n/app", "Пилот`n1–2 чата")
        body = "Метрика: минуты на пост и «доверяем / нет»"
    },
    @{
        title = "Метарамка"; sub = "нормы · власть"; tag = "отдельный слайд"; foot = "безопасность = забота"
        q = @("Не видим`nбез CLI", "Страдают`nкопипаст-SMM", "Выход`nудаление аккаунта", "Алина`nгруппа · safety")
        body = "Не «алгоритм защитит». Честный ИИ и публичный формат."
    },
    @{
        title = "ДВИГ"; sub = "Спасибо"; tag = "запрос к аудитории"; foot = "доверие — через пилот"; url = $Site
        body = "Пилот: 1–2 студ. медиа/чата СПб.`nНаставник по safety или 152-ФЗ."
    }
)

$junkExact = @(
    "Next Slide", "Коворкинг просто", "Элитная тима", "Большие данные", "Сводные таблицы", "Почему мы?",
    "GZIP", "Caffeine", "cache", "DuckDB", "20 млн строк", "Prosto", "Analitics", "Analytics",
    "Архитектура", "Оптимизация", "Мощные технологии", "для сложных задач", "Функциональность", "решения",
    "Наши", "результаты", "Время ответа с кэшированием", "Время ответа без кэширования", "Время ответа от AI",
    "Скорость генерации КЭША", "1 сек.", "3,5 мин.", "9 сек.", "4 сек.", "Наша команда"
)
$junkLike = @(
    "*Быстрое создание*", "*147.45*", "*dashboard*", "*PostgreSQL*", "*Монолитный*", "*20 МИЛЛИОНОВ*",
    "*Фронтенд*", "*Бэкэнд*", "*Инфраструктура*", "*Журавл*", "*Некрасов*", "*Back/*", "*Project Manager*",
    "*CSV/*", "*Pivot*", "*Конструктор*", "*Авторизация*"
)

function Set-Txt($sh, $t) {
    if ($null -eq $sh) { return }
    if ($sh.HasTextFrame -ne -1) { return }
    $sh.TextFrame.TextRange.Text = $(if ($t) { ($t -replace "`n", "`r") } else { "" })
    if ($t) { Fit-TextFrame $sh }
}

function Fit-TextFrame($sh) {
    try {
        $sh.TextFrame.WordWrap = -1
        # msoAutoSizeTextToFitShape = 1 — уменьшить шрифт, если не влезает
        $sh.TextFrame2.AutoSize = 1
    } catch {
        try { $sh.TextFrame.AutoSize = 1 } catch {}
    }
}

function Find-Shape($container, $name) {
    foreach ($sh in $container.Shapes) {
        if ($sh.Name -eq $name) { return $sh }
        if ($sh.Type -eq 6) {
            $f = Find-Shape $sh $name
            if ($f) { return $f }
        }
    }
    return $null
}

function Set-ByName($slide, $name, $text) {
    $sh = Find-Shape $slide $name
    if ($sh) { Set-Txt $sh $text }
}

function Rep-Like($slide, $needle, $text) {
    if (-not $text) { return }
    foreach ($sh in $slide.Shapes) {
        if ($sh.Type -eq 6) {
            foreach ($g in $sh.GroupItems) {
                if ($g.HasTextFrame -eq -1 -and $g.TextFrame.TextRange.Text -like "*$needle*") { Set-Txt $g $text }
            }
        } elseif ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.TextRange.Text -like "*$needle*") {
            Set-Txt $sh $text
        }
    }
}

function Rep-Exact($slide, $old, $text) {
    if (-not $text) { return }
    foreach ($sh in $slide.Shapes) {
        if ($sh.Type -eq 6) {
            foreach ($g in $sh.GroupItems) {
                if ($g.HasTextFrame -eq -1 -and $g.TextFrame.TextRange.Text.Trim() -eq $old) { Set-Txt $g $text }
            }
        } elseif ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.TextRange.Text.Trim() -eq $old) {
            Set-Txt $sh $text
        }
    }
}

function Clear-One($sh) {
    if ($sh.HasTextFrame -ne -1) { return }
    $t = $sh.TextFrame.TextRange.Text.Trim()
    if (-not $t) { return }
    if ($junkExact -contains $t) { Set-Txt $sh ""; return }
    foreach ($p in $junkLike) { if ($t -like $p) { Set-Txt $sh ""; return } }
    if ($t -match '^Page \d+$' -or $t -like 'http://147*' -or $t -like '*Ссылка на сайт*') { Set-Txt $sh "" }
}

function Clear-JunkSlide($slide) {
    foreach ($sh in $slide.Shapes) {
        if ($sh.Type -eq 6) { foreach ($g in $sh.GroupItems) { Clear-One $g } } else { Clear-One $sh }
    }
}

function Clear-AllText($slide) {
    foreach ($sh in $slide.Shapes) {
        if ($sh.Type -eq 6) {
            foreach ($g in $sh.GroupItems) {
                if ($g.HasTextFrame -eq -1) {
                    $t = $g.TextFrame.TextRange.Text.Trim()
                    if ($t -ne "2026") { Set-Txt $g "" }
                }
            }
        } elseif ($sh.HasTextFrame -eq -1) {
            $t = $sh.TextFrame.TextRange.Text.Trim()
            if ($t -ne "2026") { Set-Txt $sh "" }
        }
    }
}

function Fill-TitleSlide($s, $d) {
    Set-ByName $s "TextBox 17" $d.title
    Set-ByName $s "TextBox 18" $d.sub
    $tagLine = $d.tag
    if ($d.foot) { $tagLine = "$tagLine`n$($d.foot)" }
    Set-ByName $s "TextBox 19" $tagLine
    Set-ByName $s "TextBox 21" $(if ($d.body) { $d.body } else { "" })
    Set-ByName $s "TextBox 23" $d.url
}

function Fill-TwoSlide($s, $d) {
    Set-ByName $s "TextBox 29" $d.title
    Set-ByName $s "TextBox 30" $d.sub
    $foot = $d.foot
    if ($d.tag) { $foot = if ($foot) { "$($d.tag) · $foot" } else { $d.tag } }
    Set-ByName $s "TextBox 35" $foot
    Set-ByName $s "TextBox 34" ""
    Set-ByName $s "TextBox 32" $d.left
    Set-ByName $s "TextBox 33" $d.right
}

function Fill-ArchSlide($s, $d) {
    Rep-Exact $s "Архитектура" $d.title
    Rep-Exact $s "Мощные технологии" $d.title
    Set-ByName $s "TextBox 17" $d.title
    Set-ByName $s "TextBox 8" $d.title
    Rep-Like $s "Монолитный" $d.body
    Set-ByName $s "TextBox 16" $d.body
    $meta = if ($d.tag) { $d.tag } elseif ($d.sub) { $d.sub } else { $d.foot }
    Set-ByName $s "TextBox 15" $meta
    Rep-Like $s "для сложных" $d.sub
}

function Fill-QuadSlide($s, $d) {
    Set-ByName $s "TextBox 14" $d.title
    Set-ByName $s "TextBox 13" $d.sub
    for ($i = 0; $i -lt 4; $i++) {
        if ($d.q -and $i -lt $d.q.Count) { Set-ByName $s "TextBox $($16 + $i)" $d.q[$i] }
    }
    if ($d.left) { Set-ByName $s "TextBox 24" $d.left }
    if ($d.right) { Set-ByName $s "TextBox 28" $d.right }
    if ($d.body -and -not $d.left) { Set-ByName $s "TextBox 24" $d.body }
}

function Fill-FeatSlide($s, $d) {
    Set-ByName $s "TextBox 6" $d.title
    Set-ByName $s "TextBox 7" $d.sub
    Set-ByName $s "TextBox 3" $d.tag
    Set-ByName $s "TextBox 48" $d.url
    Set-ByName $s "TextBox 8" $d.body
    $featShapes = @()
    foreach ($sh in $s.Shapes) {
        if ($sh.Type -eq 6) {
            foreach ($g in $sh.GroupItems) {
                if ($g.Name -like "TextBox*") { $featShapes += $g }
            }
        }
    }
    $featShapes = $featShapes | Sort-Object Top, Left
    foreach ($g in $featShapes) { Set-Txt $g "" }
    for ($i = 0; $i -lt [Math]::Min($featShapes.Count, $d.feats.Count); $i++) {
        Set-Txt $featShapes[$i] $d.feats[$i]
    }
}

function Fill-TractionSlide($s, $d) {
    Rep-Exact $s "Наши" $d.title
    Rep-Exact $s "результаты" $d.sub
    Set-ByName $s "TextBox 8" $d.title
    Set-ByName $s "TextBox 9" $d.sub
    Set-ByName $s "TextBox 6" ""
    Set-ByName $s "TextBox 34" ""
    $names = @("TextBox 13", "TextBox 21", "TextBox 25", "TextBox 17")
    $old = @("Время ответа с кэшированием", "Время ответа без кэширования", "Время ответа от AI", "Скорость генерации КЭША")
    for ($i = 0; $i -lt 4; $i++) {
        if ($d.q -and $i -lt $d.q.Count) {
            Rep-Like $s $old[$i] $d.q[$i]
            Set-ByName $s $names[$i] $d.q[$i]
        }
    }
    foreach ($n in @("TextBox 26", "TextBox 35", "TextBox 36", "TextBox 30")) { Set-ByName $s $n "" }
    Rep-Like $s "http://147" ""
    Set-ByName $s "TextBox 30" $d.body
}

function Set-Page($s, $num) {
    $p = "{0:D2}" -f $num
    foreach ($sh in $s.Shapes) {
        if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.TextRange.Text -match '^Page \d+$') {
            Set-Txt $sh $p; return
        }
    }
}

Get-Process POWERPNT -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
Copy-Item $Template $Work -Force

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = 1
$pp.DisplayAlerts = 1
$msoFalse = 0
$pres = $pp.Presentations.Open($Work, $msoFalse, $msoFalse, $msoTrue)

$count = 0
for ($w = 0; $w -lt 60; $w++) {
    Start-Sleep -Milliseconds 500
    try { $count = $pres.Slides.Count } catch { $count = 0 }
    if ($count -ge 9) { break }
}
if ($count -lt 9) {
    $pp.Quit()
    throw "Template not loaded (slides=$count)"
}

# Duplicate вставляет копию сразу после источника — переносим в конец, иначе съезжают макеты
foreach ($src in $dupOrder) {
    $dup = $pres.Slides.Item($src).Duplicate()
    Start-Sleep -Milliseconds 200
    $dup.MoveTo($pres.Slides.Count)
    Start-Sleep -Milliseconds 100
}
for ($i = 9; $i -ge 1; $i--) {
    $pres.Slides.Item($i).Delete()
    Start-Sleep -Milliseconds 150
}

for ($n = 0; $n -lt 12; $n++) {
    $s = $pres.Slides.Item($n + 1)
    $d = $slides[$n]
    Clear-AllText $s
    Clear-JunkSlide $s
    switch ($fillers[$n]) {
        "title" { Fill-TitleSlide $s $d }
        "two" { Fill-TwoSlide $s $d }
        "arch" { Fill-ArchSlide $s $d }
        "quad" { Fill-QuadSlide $s $d }
        "feat" { Fill-FeatSlide $s $d }
        "traction" { Fill-TractionSlide $s $d }
    }
    Set-Page $s ($n + 1)
    Clear-JunkSlide $s
}

$pres.Save()
try { $pres.SaveAs($Pdf, 32); Write-Host "OK: $Pdf" } catch { Write-Warning "PDF: $_" }
try { $pres.Close() } catch {}
try { $pp.Quit() } catch {}
Start-Sleep -Seconds 2

Move-Item $Work $Pptx -Force
$size = (Get-Item $Pptx).Length
Write-Host "OK: $Pptx ($size bytes)"

$env:DVIG_SKIP_PPT = "1"
python (Join-Path $Root "scripts\replace_logo.py") 2>&1 | Out-Null
Remove-Item Env:DVIG_SKIP_PPT -ErrorAction SilentlyContinue
