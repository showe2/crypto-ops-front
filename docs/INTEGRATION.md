# INTEGRATION.md — сшивка с проектом Голиба

## REST точки
- POST /api/ingest/social_alert
- POST /api/merge_insights
- POST /api/filters
- GET  /api/token/report?query=...
- GET/POST /api/whales*
- GET/POST /api/devs*
- GET/POST /api/listings
- POST /api/sites
- POST /api/bot/{buy|sell|start|cancel}
- GET  /api/bot/history
- GET  /api/health
- POST /api/keys

## Принципы
1. Один шлюз: src/lib/api.ts управляет адресом backend (VITE_API_BASE).
2. Копирование адресов безопасно: utils/clipboard.ts с fallback.
3. Модули независимы: src/panels/* можно переносить по отдельности.
4. Пресеты как фоллбэк: src/presets/*.json.
