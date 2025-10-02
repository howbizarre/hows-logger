// hows-logger - Tail Worker за събиране на логове
import type { ProcessedLogEntry, TraceItem } from './types';

type ConsoleMethod = 'log' | 'error';

export const toIsoString = (timestamp?: number | null): string => {
  if (timestamp === null || timestamp === undefined) {
    return new Date().toISOString();
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toISOString();
};

const safeData = (value: unknown) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return '[unserializable]';
  }
};

const emitEntry = (entry: ProcessedLogEntry, method: ConsoleMethod = 'log') => {
  const prefix = entry.type.toUpperCase();
  console[method](`[${prefix}] ${JSON.stringify(entry)}`);
};

const handleTraceItem = (trace: TraceItem) => {
  const {
    logs = [],
    outcome,
    scriptName,
    eventTimestamp,
    exceptions = [],
    diagnosticsChannelEvents = [],
    event
  } = trace;

  const summary = {
    scriptName,
    outcome,
    eventTimestamp: toIsoString(eventTimestamp),
    logsCount: logs.length,
    exceptionsCount: exceptions.length,
    diagnosticsCount: diagnosticsChannelEvents.length
  };

  console.log(`[EVENT] ${JSON.stringify(summary)}`);

  logs.forEach(({ timestamp, level, message }) => {
    emitEntry({
      type: 'log',
      timestamp: toIsoString(timestamp),
      level,
      message,
      scriptName,
      outcome
    });
  });

  exceptions.forEach(({ timestamp, name, message }) => {
    emitEntry({
      type: 'exception',
      timestamp: toIsoString(timestamp),
      scriptName,
      name,
      message
    }, 'error');
  });

  diagnosticsChannelEvents.forEach(({ timestamp, channel, message }) => {
    emitEntry({
      type: 'diagnostic',
      timestamp: toIsoString(timestamp),
      scriptName,
      channel,
      message
    });
  });

  if (event) {
    emitEntry({
      type: 'event_info',
      timestamp: toIsoString(eventTimestamp),
      scriptName,
      message: safeData(event),
      eventType: typeof event
    });
  }
};

export default {
  async tail(events: TraceItem[], _env: unknown, _ctx: unknown) {
    if (!events || events.length === 0) {
      return;
    }

    console.log(`[TAIL] Получени ${events.length} събития`);

    for (const trace of events) {
      try {
        handleTraceItem(trace);
      } catch (error) {
        console.error(`[TAIL_ERROR] Грешка при обработка на събитие: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`[TAIL] Завършена обработка на ${events.length} събития`);
  }
} satisfies ExportedHandler;