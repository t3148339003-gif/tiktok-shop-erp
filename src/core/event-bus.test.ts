import { describe, it, expect } from 'vitest';
import { EventBus } from './event-bus';
import { HookSystem } from './hook-system';

describe('EventBus', () => {
  it('should emit and receive events', async () => {
    let received = false;
    EventBus.subscribe('test', ['test.event'], async () => { received = true; });
    await EventBus.emit('test.event', { data: 'hello' });
    expect(received).toBe(true);
  });

  it('should support wildcard subscriptions', async () => {
    let count = 0;
    EventBus.subscribe('test', ['*'], async () => { count++; });
    await EventBus.emit('any.event');
    await EventBus.emit('another.event');
    expect(count).toBe(2);
  });
});

describe('HookSystem', () => {
  it('should execute hooks in order', async () => {
    const order: string[] = [];
    HookSystem.register('test', 'before.test', async (ctx) => { order.push('first'); return ctx; }, 1);
    HookSystem.register('test', 'before.test', async (ctx) => { order.push('second'); return ctx; }, 2);

    await HookSystem.execute('before.test', {});
    expect(order).toEqual(['first', 'second']);
  });

  it('should support abort via hook context', async () => {
    HookSystem.register('test', 'before.abort', async (ctx) => {
      ctx.abort = true;
      ctx.abortReason = 'test abort';
      return ctx;
    });

    const result = await HookSystem.execute('before.abort', {});
    expect(result.abort).toBe(true);
    expect(result.abortReason).toBe('test abort');
  });
});
