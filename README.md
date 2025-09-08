# Crypto Ops Console — V7 (full)
Полная версия UI (все панели) с пресетами. Vite + React + TypeScript + Tailwind.

## Запуск
npm i
npm run dev
# http://localhost:5173/

## Прод
npm run build
# публикуем /dist на любой статический хостинг

## Настройка API
Создайте `.env` из `.env.sample` и при необходимости выставьте:
VITE_API_BASE=http://localhost:3000

## Панели
- Start — статусы и ключи API
- Twitter/TG — сигналы, Helius-таймер, копирование mint
- Pump — пресеты и фильтры (киты/соцсети/fees/adsDEX)
- Поиск — отчёт по токену + чат ИИ
- Киты/Dev — таблицы, импорт/экспорт CSV/JSON, фоллбэки из пресетов
- Листинги — источники, парсинг, экспорт CSV/DOCX
- Bot — покупка/продажа, пресеты сумм, история

## Тесты
Вкладка DevTests видна в DEV или с `?dev=1` в URL.
