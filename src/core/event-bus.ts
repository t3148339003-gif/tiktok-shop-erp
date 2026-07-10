/**
 * Event Bus — Decoupled communication between modules.
 *
 * Modules emit events and subscribe to events.
 * They never call each other directly.
 *
 * Example:
 *   EventBus.emit('order.created', { orderId: '123', amount: 29.99 })
 *   → Inventory module reduces stock
 *   → Finance module records revenue
 *   → Notification module pushes alert
 *   → CRM module updates buyer profile
 */

import type { SystemEvent, EventHandler } from './plugin-interface';

type Subscription = {
  id: string;
  events: string[];
  handler: EventHandler;
  moduleId: string;
};

class EventBusImpl {
  private subscriptions: Subscription[] = [];
  private eventHistory: SystemEvent[] = [];
  private maxHistory = 1000;

  /**
   * Subscribe to one or more events.
   * Returns an unsubscribe function.
   */
  subscribe(
    moduleId: string,
    events: string[],
    handler: EventHandler,
  ): () => void {
    const id = `${moduleId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    this.subscriptions.push({ id, events, handler, moduleId });
    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
    };
  }

  /**
   * Emit an event. All matching subscribers are called in parallel.
   * Each handler's errors are caught and logged — one failed handler
   * won't break others.
   */
  async emit(name: string, payload: Record<string, unknown> = {}): Promise<void> {
    const event: SystemEvent = {
      name,
      payload,
      timestamp: new Date(),
    };

    // Store event history for debugging
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistory);
    }

    const matching = this.subscriptions.filter((s) =>
      s.events.includes(name) || s.events.includes('*'),
    );

    if (matching.length === 0) return;

    // Fire all handlers in parallel, catch errors individually
    await Promise.allSettled(
      matching.map((sub) =>
        sub.handler(event).catch((err) => {
          console.error(
            `[EventBus] Handler error: ${sub.moduleId} → ${name}`,
            err,
          );
        }),
      ),
    );
  }

  /**
   * Get recent event history (for debugging/monitoring).
   */
  getHistory(limit = 50): SystemEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear all subscriptions (useful for hot-reload in dev).
   */
  clear(): void {
    this.subscriptions = [];
    this.eventHistory = [];
  }

  /**
   * List all active subscriptions (for monitoring).
   */
  listSubscriptions(): Array<{ moduleId: string; events: string[] }> {
    return this.subscriptions.map((s) => ({
      moduleId: s.moduleId,
      events: s.events,
    }));
  }
}

/** Global singleton */
export const EventBus = new EventBusImpl();
