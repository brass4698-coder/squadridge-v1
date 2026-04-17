import type { DemoAction } from './demoScript';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const DEFAULT_FOCUS_CLICK_DELAY_MS = 250;
const DEFAULT_CHAR_DELAY_MS = 100;

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const setter = desc?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
}

function dispatchInputEvents(el: HTMLElement): void {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

async function runSingleAction(action: DemoAction, isCancelled: () => boolean): Promise<void> {
  switch (action.kind) {
    case 'focus': {
      const el = document.querySelector(action.selector);
      if (!(el instanceof HTMLElement)) return;
      await sleep(action.delayMs ?? DEFAULT_FOCUS_CLICK_DELAY_MS);
      if (isCancelled()) return;
      if ('focus' in el) (el as HTMLElement & { focus: () => void }).focus();
      return;
    }
    case 'type': {
      if (action.delayMs != null && action.delayMs > 0) {
        await sleep(action.delayMs);
        if (isCancelled()) return;
      }
      const el = document.querySelector(action.selector);
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
      el.focus();
      setNativeValue(el, '');
      dispatchInputEvents(el);
      const charDelayMs = action.charDelayMs ?? DEFAULT_CHAR_DELAY_MS;
      let acc = '';
      for (const ch of action.text) {
        if (isCancelled()) return;
        acc += ch;
        setNativeValue(el, acc);
        dispatchInputEvents(el);
        await sleep(charDelayMs);
      }
      return;
    }
    case 'click': {
      const el = document.querySelector(action.selector);
      if (!(el instanceof HTMLElement)) return;
      await sleep(action.delayMs ?? DEFAULT_FOCUS_CLICK_DELAY_MS);
      if (isCancelled()) return;
      el.click();
      return;
    }
    case 'select': {
      const el = document.querySelector(action.selector);
      if (!(el instanceof HTMLSelectElement)) return;
      await sleep(action.delayMs ?? DEFAULT_FOCUS_CLICK_DELAY_MS);
      if (isCancelled()) return;
      el.value = action.value;
      dispatchInputEvents(el);
      return;
    }
  }
}

/**
 * Runs demo actions **strictly in sequence** — a plain `for` + `await` (no `Promise.all` / `map(async)`).
 * Resolves when all actions finish or when `isCancelled()` is true.
 * Does not call `navigate` / tour `goNext`; a final `click` hits the real control.
 */
export async function runDemoActions(actions: DemoAction[], isCancelled: () => boolean): Promise<void> {
  for (const action of actions) {
    if (isCancelled()) return;
    await runSingleAction(action, isCancelled);
  }
}

/** @deprecated Use `runDemoActions` */
export async function runDemoAutoActions(actions: DemoAction[], signal: AbortSignal): Promise<void> {
  await runDemoActions(actions, () => signal.aborted);
}
