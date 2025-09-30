# Как да свържете други Cloudflare Workers с Tail Worker-а `hows-logger`

След като Tail Worker-ът е деплойнат, можете да насочите други Worker приложения да изпращат своите логове към него. По-долу е описан препоръчителният процес.

## 1. Деплой на Tail Worker-а

```bash
npm install
npm run deploy
```

Уверете се, че името на услугата в `wrangler.jsonc` съвпада с това, което ще използвате като цел за tail (по подразбиране `hows-logger`).

## 2. Разрешаване на tail потребител във вашия Worker

В проекта на Worker-а, който искате да наблюдавате, добавете Tail Worker-а като потребител на trace събития. В зависимост от формата на конфигурацията това може да изглежда така:

### Пример с `wrangler.toml`

```toml
name = "my-worker"
compatibility_date = "2024-05-01"

[[tail_consumers]]
service = "hows-logger"
environment = "production" # или "development", ако използвате отделна среда
```

### Пример с `wrangler.json` / `wrangler.jsonc`

```jsonc
{
  "name": "my-worker",
  "compatibility_date": "2024-05-01",
  "tail_consumers": [
    { "service": "hows-logger", "environment": "production" }
  ]
}
```

> **Забележка:** Ако `hows-logger` има повече от една среда (например `staging`), посочете подходящата стойност в полето `environment`.

## 3. Деплой на наблюдавания Worker

След редакцията на конфигурацията деплойнете Worker-а, който наблюдавате:

```bash
wrangler deploy
```

От този момент Cloudflare автоматично ще изпраща trace събитията към Tail Worker-а при всяко изпълнение.

## 4. Наблюдение в реално време

Използвайте Wrangler, за да наблюдавате логовете в реално време:

```bash
wrangler tail --service my-worker --tail-worker hows-logger
```

Командата ще показва нормализираните JSON записи, които Tail Worker-ът генерира. Ако не посочите `--tail-worker`, Wrangler ще ползва локалната визуализация. Изричното указване гарантира, че получавате точно изхода на `hows-logger`.

## 5. Управление на достъпа

- Можете да добавяте повече от един Tail Worker към дадено приложение, като добавите няколко блока `tail_consumers`.
- За да прекратите изпращането към Tail Worker-а, просто премахнете или коментирайте съответния блок и деплойнете отново Worker-а.

Следвайки тези стъпки, ще имате надежден канал за централизирано събиране и анализ на логовете от вашите Cloudflare Workers.
