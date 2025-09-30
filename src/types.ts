// types.ts - Документация на типовете за tail worker
// Тези типове са вградени в @cloudflare/workers-types, но ги документираме тук за справка

/**
 * Основен интерфейс за tail worker handler
 */
export interface TailHandler {
  tail(events: TraceItem[], env: Env, ctx: ExecutionContext): Promise<void>;
}

/**
 * Основно събитие в tail worker-а
 */
export interface TraceItem {
  /** Име на worker-а, който генерира събитието */
  scriptName: string | null;
  
  /** Резултат от изпълнението: "ok", "exception", "canceled" */
  outcome: string;
  
  /** Timestamp на събитието */
  eventTimestamp: number | null;
  
  /** Информация за HTTP заявка или друго събитие */
  event: any; // Реалният тип е по-сложен union type
  
  /** Масив от логове (console.log, console.error и т.н.) */
  logs: TraceLog[];
  
  /** Масив от изключения и грешки */
  exceptions: TraceException[];
  
  /** Масив от diagnostic channel events */
  diagnosticsChannelEvents: TraceDiagnosticChannelEvent[];
}

/**
 * Лог запис от console.log, console.error и т.н.
 */
export interface TraceLog {
  /** Timestamp на лога */
  timestamp: number;
  
  /** Ниво на лога: "log", "error", "warn", "info" */
  level: string;
  
  /** Съдържание на лога (може да е всякакъв тип) */
  message: any;
}

/**
 * JavaScript изключение или грешка
 */
export interface TraceException {
  /** Timestamp на грешката */
  timestamp: number;
  
  /** Име на грешката (напр. "Error", "TypeError") */
  name: string;
  
  /** Съобщение за грешката */
  message: string;
}

/**
 * Diagnostic channel event
 */
export interface TraceDiagnosticChannelEvent {
  /** Timestamp на събитието */
  timestamp: number;
  
  /** Име на diagnostic channel-а */
  channel: string;
  
  /** Данни от diagnostic event */
  message: any;
}

/**
 * Формат на обработените логове в нашия worker
 */
export interface ProcessedLogEntry {
  type: 'log' | 'exception' | 'diagnostic' | 'event_info';
  timestamp: string; // ISO string
  scriptName: string | null;
  level?: string;
  message: any;
  outcome?: string;
  channel?: string; // само за diagnostic events
  name?: string; // само за exceptions
}