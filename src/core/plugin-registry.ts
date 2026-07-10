/**
 * Plugin Registry — Central module lifecycle manager.
 *
 * Loads, enables, disables, and manages all ModulePlugin instances.
 * This is the entry point for the entire system.
 */

import type { ModulePlugin, PluginManifest, NavigationItem, SlotRegistration } from './plugin-interface';
import { EventBus } from './event-bus';
import { HookSystem } from './hook-system';

class PluginRegistryImpl {
  private modules: Map<string, PluginManifest> = new Map();
  private initialized = false;
  // Store unsubscribe functions for cleanup
  private eventUnsubscribers: Map<string, (() => void)[]> = new Map();
  private hookUnsubscribers: Map<string, (() => void)[]> = new Map();

  /**
   * Register a single module plugin.
   */
  register(plugin: ModulePlugin, modulePath: string): void {
    if (this.modules.has(plugin.id)) {
      console.warn(`[PluginRegistry] Module "${plugin.id}" already registered, skipping.`);
      return;
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.modules.has(dep)) {
          console.warn(
            `[PluginRegistry] Module "${plugin.id}" depends on "${dep}" which is not registered.`,
          );
        }
      }
    }

    const manifest: PluginManifest = {
      plugin,
      path: modulePath,
      enabled: true,
      loadedAt: new Date(),
    };

    // Register events
    if (plugin.subscribe) {
      const unsubs: (() => void)[] = [];
      for (const sub of plugin.subscribe) {
        const unsub = EventBus.subscribe(plugin.id, sub.events, sub.handler);
        unsubs.push(unsub);
      }
      this.eventUnsubscribers.set(plugin.id, unsubs);
    }

    // Register hooks
    if (plugin.hooks) {
      const unsubs: (() => void)[] = [];
      for (const hook of plugin.hooks) {
        const unsub = HookSystem.register(
          plugin.id,
          hook.name,
          hook.handler,
        );
        unsubs.push(unsub);
      }
      this.hookUnsubscribers.set(plugin.id, unsubs);
    }

    this.modules.set(plugin.id, manifest);
    console.log(`[PluginRegistry] ✅ ${plugin.id} v${plugin.version} loaded`);
  }

  /**
   * Register multiple modules at once.
   */
  registerAll(plugins: Array<{ plugin: ModulePlugin; path: string }>): void {
    for (const { plugin, path } of plugins) {
      this.register(plugin, path);
    }
    this.initialized = true;
    EventBus.emit('system.initialized', { moduleCount: this.modules.size });
  }

  /**
   * Initialize all modules (call onInit).
   */
  async initAll(): Promise<void> {
    for (const [, manifest] of this.modules) {
      if (manifest.enabled && manifest.plugin.onInit) {
        try {
          await manifest.plugin.onInit();
        } catch (err) {
          console.error(
            `[PluginRegistry] Init failed for "${manifest.plugin.id}":`,
            err,
          );
          manifest.loadError = String(err);
        }
      }
    }
    this.initialized = true;
    EventBus.emit('system.initialized', { moduleCount: this.modules.size });
  }

  /**
   * Get a specific module by ID.
   */
  getModule(id: string): PluginManifest | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules.
   */
  getAllModules(): PluginManifest[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all enabled modules.
   */
  getEnabledModules(): PluginManifest[] {
    return this.getAllModules().filter((m) => m.enabled);
  }

  /**
   * Enable a module.
   */
  enable(id: string): void {
    const manifest = this.modules.get(id);
    if (!manifest) throw new Error(`Module "${id}" not found`);
    manifest.enabled = true;
    EventBus.emit('module.enabled', { moduleId: id });
  }

  /**
   * Disable a module.
   */
  async disable(id: string): Promise<void> {
    const manifest = this.modules.get(id);
    if (!manifest) throw new Error(`Module "${id}" not found`);
    if (manifest.plugin.required) {
      throw new Error(`Module "${id}" is required and cannot be disabled.`);
    }
    manifest.enabled = false;

    // Cleanup event subscriptions
    const evtUnsubs = this.eventUnsubscribers.get(id);
    if (evtUnsubs) {
      evtUnsubs.forEach((fn) => fn());
      this.eventUnsubscribers.delete(id);
    }

    // Cleanup hook subscriptions
    const hookUnsubs = this.hookUnsubscribers.get(id);
    if (hookUnsubs) {
      hookUnsubs.forEach((fn) => fn());
      this.hookUnsubscribers.delete(id);
    }

    if (manifest.plugin.onDestroy) {
      await manifest.plugin.onDestroy();
    }

    EventBus.emit('module.disabled', { moduleId: id });
  }

  /**
   * Get all registered navigation items from all enabled modules.
   */
  getNavigation(): NavigationItem[] {
    const nav: NavigationItem[] = [];
    for (const [, manifest] of this.modules) {
      if (!manifest.enabled) continue;
      if (manifest.plugin.ui?.navigation) {
        nav.push(...manifest.plugin.ui.navigation);
      }
    }
    return nav.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  /**
   * Get all registered UI slots from all enabled modules.
   */
  getSlots(slotName: string): SlotRegistration[] {
    const slots: SlotRegistration[] = [];
    for (const [, manifest] of this.modules) {
      if (!manifest.enabled) continue;
      if (manifest.plugin.ui?.slots) {
        const matching = manifest.plugin.ui.slots.filter(
          (s) => s.slot === slotName,
        );
        slots.push(...matching);
      }
    }
    return slots.sort(
      (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
    );
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Unload all modules (for hot-reload or shutdown).
   */
  async destroy(): Promise<void> {
    for (const [, manifest] of this.modules) {
      if (manifest.plugin.onDestroy) {
        await manifest.plugin.onDestroy().catch(console.error);
      }
    }
    EventBus.clear();
    HookSystem.clear();
    this.modules.clear();
    this.eventUnsubscribers.clear();
    this.hookUnsubscribers.clear();
    this.initialized = false;
  }
}

/** Global singleton */
export const PluginRegistry = new PluginRegistryImpl();
