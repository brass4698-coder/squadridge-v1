/** @deprecated Import from `./sendQueue` — kept for existing imports. */
export {
  enqueuePendingSend,
  listPendingSendsForSquad,
  removePendingSend,
  resetMessageSendQueueForTests,
  sendRetryDelayMs,
  sleep,
  SEND_RETRY_ATTEMPTS,
  SEND_RETRY_BASE_MS,
  SEND_RETRY_MAX_MS,
  type PendingSendRecord,
} from './sendQueue';
