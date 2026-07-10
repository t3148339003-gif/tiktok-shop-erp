/**
 * Hook System — Intercept and modify operations.
 *
 * Hooks allow modules to run logic before/after key operations.
 * Unlike events (fire-and-forget), hooks can MODIFY data or ABORT operations.
 *
 * Example:
 *   beforeProductPublish → validate product data, abort if incomplete
 *   afterOrderShip → record finance entry, send notification
 *   onPriceChange → alert competitor tracking module
 */

import type { HookContext, HookHandler } from './plugin-interface';

type HookRegistration = {
  name: string;
  handler: HookHandler;
  moduleId: string;
  priority: number; // lower = runs first
};

class HookSystemImpl {
  private hooks: Map<string, HookRegistration[]> = new Map();

  /**
   * Register a hook handler for a named hook point.
   */
  register(
    moduleId: string,
    hookName: string,
    handler: HookHandler,
    priority = 100,
  ): () => void {
    const reg: HookRegistration = { name: hookName, handler, moduleId, priority };
    const existing = this.hooks.get(hookName) || [];
    existing.push(reg);
    existing.sort((a, b) => a.priority - b.priority);
    this.hooks.set(hookName, existing);

    return () => {
      const list = this.hooks.get(hookName) || [];
      this.hooks.set(
        hookName,
        list.filter((r) => r !== reg),
      );
    };
  }

  /**
   * Execute all hooks for a given hook point.
   * Hooks run in priority order.
   * Each hook can modify context.data or set context.abort = true.
   * Returns the final context after all hooks have run.
   */
  async execute(hookName: string, initialData: Record<string, unknown> = {}): Promise<HookContext> {
    const ctx: HookContext = {
      action: hookName,
      data: { ...initialData },
      meta: new Map(),
      abort: false,
    };

    const handlers = this.hooks.get(hookName) || [];

    for (const reg of handlers) {
      if (ctx.abort) break;
      try {
        const result = await reg.handler(ctx);
        // Merge any changes
        Object.assign(ctx, result);
      } catch (err) {
        console.error(
          `[HookSystem] Error in ${reg.moduleId} → ${hookName}:`,
          err,
        );
        // Don't abort on hook error — log and continue
      }
    }

    return ctx;
  }

  /**
   * List all registered hook points (for monitoring).
   */
  listHooks(): Array<{ name: string; handlers: number }> {
    return Array.from(this.hooks.entries()).map(([name, handlers]) => ({
      name,
      handlers: handlers.length,
    }));
  }

  clear(): void {
    this.hooks.clear();
  }
}

/** Global singleton */
export const HookSystem = new HookSystemImpl();
