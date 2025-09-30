// hows-logger - Tail Worker за събиране на логове
import type { ProcessedLogEntry, TraceException, TraceItem, TraceLog, TraceDiagnosticChannelEvent } from './types';

type ConsoleMethod = 'log' | 'error';

const toIsoString = (timestamp?: number | null): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }

  try {
    return new Date(timestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
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

const logTraceLogs = (scriptName: string | null, outcome: string, logs: TraceLog[]) => {
  for (const { timestamp, level, message } of logs) {
    emitEntry(
      {
        type: 'log',
        timestamp: toIsoString(timestamp),
        level,
        message,
        scriptName,
        outcome
      },
      'log'
    );
  }
};

const logTraceExceptions = (scriptName: string | null, exceptions: TraceException[]) => {
  for (const { timestamp, name, message } of exceptions) {
    emitEntry(
      {
        type: 'exception',
        timestamp: toIsoString(timestamp),
        scriptName,
        name,
        message
      },
      'error'
    );
  }
};

const logDiagnosticEvents = (scriptName: string | null, diagnostics: TraceDiagnosticChannelEvent[]) => {
  for (const { timestamp, channel, message } of diagnostics) {
    emitEntry(
      {
        type: 'diagnostic',
        timestamp: toIsoString(timestamp),
        scriptName,
        channel,
        message
      },
      'log'
    );
  }
};

const logEventData = (scriptName: string | null, eventTimestamp: number | null, eventData: unknown) => {
  emitEntry(
    {
      type: 'event_info',
      timestamp: toIsoString(eventTimestamp),
      scriptName,
      message: safeData(eventData),
      eventType: typeof eventData
    },
    'log'
  );
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
    eventTimestamp: eventTimestamp ? toIsoString(eventTimestamp) : null,
    logsCount: logs.length,
    exceptionsCount: exceptions.length,
    diagnosticsCount: diagnosticsChannelEvents.length
  };

  console.log(`[EVENT] ${JSON.stringify(summary)}`);

  if (logs.length > 0) {
    logTraceLogs(scriptName, outcome, logs);
  }

  if (exceptions.length > 0) {
    logTraceExceptions(scriptName, exceptions);
  }

  if (diagnosticsChannelEvents.length > 0) {
    logDiagnosticEvents(scriptName, diagnosticsChannelEvents);
  }

  if (event) {
    logEventData(scriptName, eventTimestamp, event);
  }
};

export default {
  async tail(events, _env, _ctx) {
    if (!events || events.length === 0) {
      return;
    }

    console.log(`[TAIL] Получени ${events.length} събития`);

    for (const trace of events) {
      try {
        handleTraceItem(trace as TraceItem);
      } catch (error) {
        console.error(`[TAIL_ERROR] Грешка при обработка на събитие: ${error instanceof Error ? error.message : error}`);
      }
    }

    console.log(`[TAIL] Завършена обработка на ${events.length} събития`);
  }
} satisfies ExportedHandler<Env>;
