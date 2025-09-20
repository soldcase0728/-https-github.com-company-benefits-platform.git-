// Simple analytics/event logger stub. Replace with real vendor integration later.
export type AnalyticsEvent =
  | { type: 'upload_started'; fileName: string; size: number }
  | { type: 'upload_success'; fileName: string; durationMs: number }
  | { type: 'upload_failed'; fileName: string; error: string }
  | { type: 'extraction_completed'; fields: number; durationMs: number }
  | { type: 'field_edited'; field: string }
  | { type: 'theme_toggled'; dark: boolean };

const queue: AnalyticsEvent[] = [];

export function logEvent(evt: AnalyticsEvent) {
  queue.push(evt);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', evt);
  }
}

export function flushEvents() {
  // Placeholder - send to backend or third-party
  queue.length = 0;
}
