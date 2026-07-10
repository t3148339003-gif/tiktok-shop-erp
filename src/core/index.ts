/**
 * TikTok Shop ERP — Core Framework
 *
 * The plugin-based, event-driven, hook-extensible architecture
 * that powers the entire ERP system.
 */

export { PluginRegistry } from './plugin-registry';
export { EventBus } from './event-bus';
export { HookSystem } from './hook-system';
export { Slot, SlotProvider, SlotRenderer, useSlotContext, SLOT_DEFINITIONS } from './slot-system';
export type { SlotName } from './slot-system';
export { CustomFields } from './custom-fields';
export type {
  ModulePlugin,
  PluginManifest,
  SystemEvent,
  EventHandler,
  HookContext,
  HookHandler,
  SlotRegistration,
  SlotDefinition,
  NavigationItem,
  IntegrationConfig,
  ModuleSchema,
} from './plugin-interface';
