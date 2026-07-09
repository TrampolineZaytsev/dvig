# Build present.pptx (12 slides «Метамышь», CHTENIE.html C1) + present.pdf
# Content: PROJECT.md, answers.html, first_plan.md, site copy
$ErrorActionPreference = "Stop"
$Root = "E:\DVIG"
$Template = Join-Path $Root "Purple Black Modern Marketing Plan Presentation (2).pptx"
$Pptx = Join-Path $Root "present.pptx"
$Pdf = Join-Path $Root "present.pdf"
$Site = "http://localhost:3000"

# --- 12 slides: short lines to avoid overflow ---
$slides = @(
    @{
        title = "ДВИГ"
        sub   = "Живые встречи по интересам"
        tag   = "Зайцев · Журавлёв · Полина · Соня · Настя"
        foot  = "Дело → люди → офлайн"
        url   = $Site
    },
    @{
        title = "Проблема"
        sub   = "хаос афиши"
        tag   = "из поля · СПб"
        foot  = "Манеж · «Этажи» · «Родина»"
        left  = "Манеж: три источника времени у стойки."
        right = "«Этажи»: пять вкладок — решение голосом.`n«Родина»: сайт ≠ stories в очереди."
    },
    @{
        title = "Инсайт"
        sub   = "ось «общение»"
        tag   = "не каталог id"
        foot  = "афиша — повод для разговора"
        left  = "Досуг — совместное действие и доверие к месту."
        right = "Решение в чате и голосом.`nПродукт подкладывает артефакт в диалог."
    },
    @{
        title = "Решение"
        sub   = "ДВИГ + spb-events"
        tag   = "взлом нормы"
        foot  = "куратор с ответственностью"
        body  = "KudaGo → нормализация → (опц.) ИИ → чат / export.`nДВИГ: компания на событие · не dating.`nВеб-демо: $Site/app"
    },
    @{
        title = "Рынок"
        sub   = "TAM / SAM / SOM"
        tag   = "≥ 1:30 на защите"
        foot  = "B2B2C-пилот сейчас"
        q     = @("TAM`nдосуг в городе", "SAM`n18–28 · СПб/МСК", "SOM`n1–2 медиа/чата", "Платит`nорганизатор")
        left  = "Разрыв: dating (свайпы) vs афиша (куда) — нет «с кем»."
        right = "Сейчас: пилот CLI для редакций.`nГоризонт: freemium + комиссии партнёров."
    },
    @{
        title = "Продукт"
        sub   = "spb-events · 8 команд"
        tag   = "MVP + веб-демо"
        url   = "$Site/app"
        feats = @("search", "info", "analyze", "export", "share", "trending", "prices", "config")
        body  = "Веб: Next.js · афиша KudaGo · мок групп и safety."
    },
    @{
        title = "Доверие"
        sub   = "алгоритм ≠ доверие"
        tag   = "факт / ИИ / человек"
        foot  = "прозрачность источника"
        body  = "Факт → KudaGo · смысл → ИИ (маркировка).`nshare → решение редактора.`nОшибка модели ≠ ложь площадки."
    },
    @{
        title = "Монетизация"
        sub   = "и рост"
        tag   = "не берём за общение"
        foot  = "честная реклама"
        q     = @("Freemium`nпользователям", "Комиссии`nбилеты", "Размещение`nплощадкам", "Пилот`nбез выручки")
    },
    @{
        title = "Конкуренты"
        sub   = "ниша ДВИГ"
        tag   = "позиция"
        foot  = "KudaGo = данные, не враг"
        left  = "Dating: Twinby, Bumble, VK Dating — давление «свидания»."
        right = "Афиши: Timepad, KudaGo — «куда», не «с кем».`nМы: дело + люди + честные данные."
    },
    @{
        title = "Трекция"
        sub   = "сделано и пилот"
        tag   = "метаисследование"
        q     = @("6 записей`nдневника", "spb-events`nCLI", "Веб-демо`n/app", "Метрика`nдоверие/мин")
        body  = "План: 1–2 студ. медиа СПб · обратная связь «доверяем / нет»."
    },
    @{
        title = "Метарамка"
        sub   = "нормы · власть"
        tag   = "только этот слайд"
        foot  = "безопасность = забота"
        q     = @("Не видим`nбез CLI", "Страдают`nкопипаст", "Выход`nконфиг/аккаунт", "Алина`nгруппа · safety")
        body  = "Не «алгоритм защитит». Честный ИИ · слепые зоны · публичный формат."
    },
    @{
        title = "ДВИГ"
        sub   = "Спасибо"
        tag   = "запрос к аудитории"
        foot  = "доверие — через пилот"
        url   = $Site
        body  = "Пилот: 1–2 студ. медиа или чата в СПб.`nНаставник по safety офлайн-встреч."
    }
)

$dupOrder = @(1, 2, 2, 5, 6, 3, 5, 6, 2, 7, 6, 1)
$finalTpl = @(4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 8, 9)

# Template leftovers to erase (unrelated projects)
$junkExact = @(
    "Next Slide", "Коворкинг просто", "Элитная тима", "Большие данные",
    "Сводные таблицы", "Почему мы?", "GZIP", "Caffeine", "cache", "DuckDB",
    "20 млн строк", "Фронтенд", "Бэкэнд", "БД", "Инфраструктура",
    "Монолитный бэкенд + SPA, данные в PostgreSQL, тяжёлая аналитика",
    "Время ответа с кэшированием", "Время ответа без кэширования", "Время ответа от AI",
    "1 сек.", "3,5 мин.", "9 сек.", "4 сек.", "Наша команда",
    "Загрузка", "CSV", "Конструктор", "Pivot", "Генерация", "pivot", "AI", "таблиц",
    "Prosto", "Analitics", "Analytics", "Архитектура", "Оптимизация",
    "Мощные технологии", "для сложных задач", "Функциональность", "решения",
    "Наши", "результаты", "Page 3", "Page 4", "Page 5", "Page 6", "Page 7"
)
$junkContains = @(
    "Быстрое создание сводных", "Решение работает ДОЛИ СЕКУНДЫ",
    "20 МИЛЛИОНОВ", "147.45.233.15", "dashboards", "КОНСТРУКТОР",
    "PostgreSQL", "coworking", "Сбер"
)

Get-Process POWERPNT -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Copy-Item $Template $Pptx -Force

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = 1
$msoFalse = 0
$pres = $pp.Presentations.Open($Pptx, $msoFalse, $msoFalse, $msoTrue)
$slideCount = 0
for ($w = 0; $w -lt 40; $w++) {
    try { $slideCount = $pres.Slides.Count } catch { $slideCount = @($pres.Slides).Count }
    if ($slideCount -ge 9) { break }
    Start-Sleep -Milliseconds 500
}
if ($slideCount -lt 9) { throw "Template not loaded (slides=$slideCount)" }

foreach ($srcIdx in $dupOrder) { $pres.Slides.Item($srcIdx).Duplicate() | Out-Null }
for ($i = 9; $i -ge 1; $i--) { $pres.Slides.Item($i).Delete() }

function Set-Txt($sh, $t) {
    if ($null -eq $t) { return }
    if ($sh.HasTextFrame -eq -1) {
        $sh.TextFrame.TextRange.Text = ($t -replace "`n", "`r")
        try {
            $sh.TextFrame.TextRange.Font.Name = "Segoe UI"
        } catch {}
    }
}

function Walk-Shapes($slide, $scriptBlock) {
    foreach ($sh in $slide.Shapes) {
        if ($sh.Type -eq 6) {
            foreach ($g in $sh.GroupItems) { & $scriptBlock $g }
        } else {
            & $scriptBlock $sh
        }
    }
}

function Clear-Junk($slide) {
    Walk-Shapes $slide {
        param($sh)
        if ($sh.HasTextFrame -ne -1) { return }
        $t = $sh.TextFrame.TextRange.Text.Trim()
        if (-not $t) { return }
        foreach ($j in $junkExact) {
            if ($t -eq $j) { Set-Txt $sh ""; return }
        }
        foreach ($p in $junkContains) {
            if ($t -like "*$p*") { Set-Txt $sh ""; return }
        }
        if ($t -match '^Page \d+$') { Set-Txt $sh "" }
        if ($t -match '^0[1-9]$' -and $t.Length -eq 2) { Set-Txt $sh "" }
    }
}

function Rep($slide, $old, $new) {
    if (-not $new) { return }
    Walk-Shapes $slide {
        param($sh)
        if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.TextRange.Text.Trim() -eq $old.Trim()) {
            Set-Txt $sh $new
        }
    }
}

function RepLike($slide, $needle, $new) {
    if ($null -eq $new) { return }
    Walk-Shapes $slide {
        param($sh)
        if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.TextRange.Text -like "*$needle*") {
            Set-Txt $sh $new
        }
    }
}

function Set-Quad($slide, $labels) {
    if (-not $labels) { return }
    $boxes = @($slide.Shapes | Where-Object { $_.Name -match '^TextBox 1[6-9]$' } | Sort-Object { [int]($_.Name -replace '\D', '') })
    for ($i = 0; $i -lt [Math]::Min(4, $labels.Count); $i++) {
        if ($i -lt $boxes.Count) { Set-Txt $boxes[$i] $labels[$i] }
    }
}

function Fill-Title($s, $d) {
    Rep $s "Prosto" $d.title
    Rep $s "Analitics" $d.sub
    Rep $s "Analytics" $d.sub
    Rep $s "Элитная тима" $d.tag
    Rep $s "Коворкинг просто" $d.foot
    RepLike $s "Ссылка" $d.url
    RepLike $s "http://" $d.url
    if ($d.body) { RepLike $s "Монолитный" $d.body; RepLike $s "Коворкинг" $d.body }
}

function Fill-Two($s, $d) {
    Rep $s "Prosto" $d.title
    Rep $s "Analitics" $d.sub
    Rep $s "Analytics" $d.sub
    Rep $s "Почему мы?" $d.tag
    Rep $s "Сводные таблицы" $d.foot
    RepLike $s "Быстрое создание" $d.left
    RepLike $s "Решение работает" $d.right
    RepLike $s "Коворкинг" $d.foot
}

function Fill-Arch($s, $d) {
    Rep $s "Архитектура" $d.title
    RepLike $s "Монолитный" $d.body
    Rep $s "Мощные технологии" $d.title
    RepLike $s "для сложных" $d.sub
    Rep $s "Элитная тима" $d.tag
    if ($d.body) { RepLike $s "GZIP" $d.body }
}

function Fill-Quad($s, $d) {
    Rep $s "Оптимизация" $d.title
    Rep $s "Элитная тима" $d.tag
    Set-Quad $s $d.q
    if ($d.left) { RepLike $s "Быстрое" $d.left; RepLike $s "Решение" $d.right }
    if ($d.body) { RepLike $s "GZIP" $d.body }
}

function Fill-Feat($s, $d) {
    Rep $s "Функциональность" $d.title
    Rep $s "решения" $d.sub
    Rep $s "Элитная тима" $d.tag
    RepLike $s "http://" $d.url
    if ($d.body) { RepLike $s "Загрузка" $d.body }
    $keys = @("Загрузка", "CSV", "Конструктор", "Pivot", "Генерация", "pivot", "AI", "таблиц")
    $fi = 0
    $all = @()
    foreach ($sh in $s.Shapes) {
        if ($sh.Type -eq 6) { foreach ($g in $sh.GroupItems) { $all += $g } } else { $all += $sh }
    }
    foreach ($sh in $all) {
        if ($sh.HasTextFrame -ne -1) { continue }
        $t = $sh.TextFrame.TextRange.Text
        foreach ($k in $keys) {
            if ($t -like "*$k*" -and $fi -lt $d.feats.Count) { Set-Txt $sh $d.feats[$fi]; $fi++; break }
        }
    }
}

function Fill-Met($s, $d) {
    Rep $s "Наши" $d.title
    Rep $s "результаты" $d.sub
    Rep $s "Элитная тима" $d.tag
    Set-Quad $s $d.q
    if ($d.body) {
        RepLike $s "Время ответа" $d.body
        RepLike $s "GZIP" $d.body
    }
}

function Fill-Tech($s, $d) {
    Fill-Title $s $d
}

function Fill-Team($s, $d) {
    Rep $s "Наша команда" $d.title
    Rep $s "Элитная тима" $d.tag
    if ($d.body) { RepLike $s "Коворкинг" $d.body }
    if ($d.url) { RepLike $s "http://" $d.url }
}

function Set-PageNum($s, $num) {
    RepLike $s "Page " ("{0:D2}" -f $num)
    Walk-Shapes $s {
        param($sh)
        if ($sh.HasTextFrame -ne -1) { return }
        $t = $sh.TextFrame.TextRange.Text.Trim()
        if ($t -match '^\d{2}$' -and [int]$t -ne $num) { Set-Txt $sh ("{0:D2}" -f $num) }
    }
}

for ($n = 0; $n -lt 12; $n++) {
    $d = $slides[$n]
    $s = $pres.Slides.Item($n + 1)
    $tpl = $finalTpl[$n]
    switch ($tpl) {
        1 { Fill-Title $s $d }
        2 { Fill-Two $s $d }
        3 { Fill-Feat $s $d }
        4 { Fill-Tech $s $d }
        5 { Fill-Arch $s $d }
        6 { Fill-Quad $s $d }
        7 { Fill-Met $s $d }
        8 { Fill-Team $s $d }
        9 { Fill-Title $s $d }
    }
    Set-PageNum $s ($n + 1)
    Clear-Junk $s
    # Second pass — ensure title/sub on every slide
    Rep $s "Prosto" $d.title
    Rep $s "Analitics" $d.sub
    Rep $s "Analytics" $d.sub
}

$pres.Save()
try {
    $pres.SaveAs($Pdf, 32)
    Write-Host "OK: $Pdf"
} catch {
    Write-Warning "PDF: $_"
}
Write-Host "OK: $Pptx ($($pres.Slides.Count) slides)"
