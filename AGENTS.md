<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Структура кода

См. `.cursor/rules/project-architecture.mdc` и `DESCRIBE.md` §9.

Кратко: `src/app/` — маршруты; `src/components/{ui,layout,auth,events,app,marketing}/` — UI; `src/lib/{server,client,events,kudago}/` — логика; `src/hooks/` — хуки.