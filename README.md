# Hows Logger - Cloudflare Tail Worker

Този Tail Worker събира логове от другите ви Cloudflare Workers приложения.

## Функционалност

Tail Worker-ът автоматично:
- Събира всички логове (console.log, console.error и т.н.)
- Записва изключения и грешки
- Логва diagnostic channel events
- Форматира всички данни в структуриран JSON формат
- Добавя timestamp и metadata към всеки запис

## Типове логове

Worker-ът обработва следните типове данни:
- **logs**: Стандартни логове от console.log/error/warn
- **exceptions**: JavaScript грешки и изключения
- **diagnostics**: Diagnostic channel events
- **event_info**: Информация за HTTP заявки и други събития

## Конфигурация

### wrangler.jsonc
```jsonc
{
  "name": "hows-logger",
  "main": "src/index.ts",
  "compatibility_date": "2025-09-27",
  "observability": { 
    "enabled": true 
  },
  "logpush": false
}
```

## Използване

### Метод 1: С npm скриптове (PowerShell/CMD)
```bash
# Разработка
npm run dev

# Деплойване
npm run deploy

# Проверка на типове
npx tsc --noEmit
```

### Метод 2: С batch файл (CMD - препоръчително за Windows)
```cmd
# Разработка
run.bat dev

# Деплойване  
run.bat deploy

# Проверка на TypeScript
run.bat check

# Помощ
run.bat
```

### Метод 3: Директно с CMD
```cmd
# Разработка
cmd /c "cd /d d:\Dev\OTHER\hows-logger && npm run dev"

# Деплойване
cmd /c "cd /d d:\Dev\OTHER\hows-logger && npm run deploy"
```

### 3. Конфигуриране на други Workers

За да свържете други Workers към този tail worker, добавете в тяхната `wrangler.toml` конфигурация:

```toml
[observability]
enabled = true

# За конкретен tail worker
[tail_consumers]
services = ["hows-logger"]
```

Или използвайте Cloudflare Dashboard:
1. Отидете в Workers & Pages
2. Изберете worker-а, който искате да наблюдавате
3. Settings > Observability > Real-time Logs
4. Добавете `hows-logger` като tail consumer

## Структура на логовете

Всеки лог запис съдържа:

```json
{
  "type": "log|exception|diagnostic|event_info",
  "timestamp": "2025-09-30T15:30:00.000Z",
  "scriptName": "my-worker",
  "level": "log|error|warn|info",
  "message": "съдържанието на лога",
  "outcome": "ok|exception|canceled",
  "channel": "diagnostic-channel-name" // само за diagnostic events
}
```

## Персистентност

В момента логовете се изписват в конзолата. За продукционна употреба можете да:

1. **Analytics Engine**: Добавете логовете към Analytics Engine за анализ
2. **Durable Objects**: Съхранявайте логове за по-дълъг период
3. **KV**: Временно съхранение за кеширане
4. **External API**: Изпращайте към външна система за логове

## Примерна имплементация с Analytics Engine

```typescript
// В tail функцията
const analyticsEngine = env.ANALYTICS_ENGINE;
await analyticsEngine.writeDataPoint({
  blobs: [logEntry.scriptName, logEntry.level],
  doubles: [Date.now()],
  indexes: [logEntry.message]
});
```

## Сигурност

- Worker-ът не изпраща данни към външни системи
- Всички логове остават в Cloudflare екосистемата
- Конфигурацията позволява контрол върху logpush