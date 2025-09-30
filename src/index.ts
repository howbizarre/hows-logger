// hows-logger - Tail Worker за събиране на логове
export default {
  async tail(events, env, ctx) {
    // Ако няма събития, не правим нищо
    if (!events || events.length === 0) {
      return;
    }

    console.log(`[TAIL] Получени ${events.length} събития`);

    for (const event of events) {
      try {
        // Обработваме всеки лог евент
        const logs = event.logs || [];
        const outcome = event.outcome;
        const scriptName = event.scriptName;
        const eventTimestamp = event.eventTimestamp;

        // Базова информация за събитието
        const eventInfo = {
          scriptName,
          outcome,
          eventTimestamp: eventTimestamp ? new Date(eventTimestamp).toISOString() : null,
          logsCount: logs.length,
          exceptionsCount: event.exceptions?.length || 0,
          diagnosticsCount: event.diagnosticsChannelEvents?.length || 0
        };

        console.log(`[EVENT] ${JSON.stringify(eventInfo)}`);

        // Филтрираме и форматираме логовете
        for (const log of logs) {
          const logEntry = {
            type: 'log',
            timestamp: new Date(log.timestamp).toISOString(),
            level: log.level,
            message: log.message,
            scriptName: scriptName,
            outcome: outcome
          };

          console.log(`[LOG] ${JSON.stringify(logEntry)}`);
        }

        // Ако има грешки, ги логваме отделно
        if (event.exceptions && event.exceptions.length > 0) {
          for (const exception of event.exceptions) {
            const errorEntry = {
              type: 'exception',
              timestamp: new Date(exception.timestamp).toISOString(),
              scriptName: scriptName,
              name: exception.name,
              message: exception.message
            };

            console.error(`[ERROR] ${JSON.stringify(errorEntry)}`);
          }
        }

        // Логваме diagnostic channel events ако има такива
        if (event.diagnosticsChannelEvents && event.diagnosticsChannelEvents.length > 0) {
          for (const diagnosticEvent of event.diagnosticsChannelEvents) {
            const diagnosticEntry = {
              type: 'diagnostic',
              timestamp: new Date(diagnosticEvent.timestamp).toISOString(),
              scriptName: scriptName,
              channel: diagnosticEvent.channel,
              message: diagnosticEvent.message
            };

            console.log(`[DIAGNOSTIC] ${JSON.stringify(diagnosticEntry)}`);
          }
        }

        // Логваме информация за HTTP заявките, ако има такива
        if (event.event) {
          const eventEntry = {
            type: 'event_info',
            timestamp: eventTimestamp ? new Date(eventTimestamp).toISOString() : new Date().toISOString(),
            scriptName: scriptName,
            eventType: typeof event.event,
            eventData: event.event
          };

          console.log(`[EVENT_INFO] ${JSON.stringify(eventEntry)}`);
        }

      } catch (error) {
        console.error(`[TAIL_ERROR] Грешка при обработка на събитие: ${error}`);
      }
    }

    console.log(`[TAIL] Завършена обработка на ${events.length} събития`);
  }
} satisfies ExportedHandler<Env>;
