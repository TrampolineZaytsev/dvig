---
name: Сайт по замечаниям
overview: "План доработки веб-сайта ДВИГ (лендинг `/`, демо `/app`, новые информационные страницы) так, чтобы публичный интерфейс отражал PROJECT.md и закрывал замечания ревьюеров: честность демо, «не dating», B2B, безопасность/данные, социальный слой (мок), прозрачность KudaGo и «факт vs текст»."
todos:
  - id: shared-nav
    content: Создать SiteHeader/SiteFooter и подключить на /, /app, /safety, /partners; обновить layout metadata
    status: completed
  - id: landing-sections
    content: "Расширить src/app/page.tsx: CTA, «не dating», 3 шага, JTBD, B2B-тизер, конкуренты-кратко"
    status: completed
  - id: safety-page
    content: Добавить src/app/safety/page.tsx (безопасность, данные, roadmap, ссылка на демо)
    status: completed
  - id: partners-page
    content: Добавить src/app/partners/page.tsx (B2B выгоды, B2B2C гипотеза, контакт пилота)
    status: completed
  - id: demo-honesty
    content: "event-browser: баннер «Демо», переименовать ИИ-лейблы, дисклеймеры заявок и источника KudaGo"
    status: completed
  - id: social-mock
    content: "map.ts + events.ts + EventCard/Sheet: мок группы/мест/модератора, фильтр «есть места»"
    status: completed
  - id: panels-polish
    content: "SafetyPanel/ProfilePanel/Settings: ссылки на /safety, текст про группы и ограничения MVP"
    status: completed
  - id: qa-build
    content: Проверка mobile + npm run build + чек-лист приёмки
    status: completed
---
