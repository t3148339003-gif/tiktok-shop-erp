/**
 * TikTok Shop ERP — Plugin Interface
 *
 * Every module in the system implements this interface.
 * New modules = new features, without touching core code.
 */

import type { ReactNode, ComponentType } from 'react';
import type { TRPCBuilder, AnyRouter } from '@trpc/server';

// ─── Event System ────────────────────────────────────
export interface SystemEvent {
  name: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export type EventHandler = (event: SystemEvent) => Promise<void>;

// ─── Hook System ─────────────────────────────────────
export interface HookContext {
  action: string;
  data: Record<string, unknown>;
  userId?: string;
  shopId?: string;
  /** Modules can attach metadata to pass between hooks */
  meta: Map<string, unknown>;
  /** Set to true to abort the operation */
  abort: boolean;
  /** Reason for abort */
  abortReason?: string;
}

export type HookHandler = (ctx: HookContext) => Promise<HookContext>;

// ─── UI Slot System ──────────────────────────────────
export interface SlotDefinition {
  /** Unique slot name, e.g. 'dashboard::overview-top' */
  name: string;
  /** Human-readable description */
  description: string;
  /** Default priority (lower = rendered first) */
  defaultPriority: number;
}

export interface SlotRegistration {
  slot: string;
  component: ComponentType<{ shopId?: string }>;
  priority?: number;
}

// ─── Navigation ──────────────────────────────────────
export interface NavigationItem {
  label: string;
  icon: string;        // Lucide icon name
  path: string;
  position: 'top' | 'bottom';
  /** Module ID this nav belongs to (for ordering) */
  moduleId: string;
  /** Order within position group */
  order?: number;
  /** Badge count (e.g., pending orders) */
  badge?: number;
}

// ─── Database ────────────────────────────────────────
export interface ModuleSchema {
  /** Raw Prisma schema string to append */
  prismaSchema?: string;
  /** SQL migration files */
  migrations?: string[];
  /** Seed function */
  seed?: () => Promise<void>;
}

// ─── Integration ─────────────────────────────────────
export interface IntegrationConfig {
  name: string;
  type: 'oauth' | 'api_key' | 'webhook';
  configSchema: Record<string, unknown>;
}

// ─── Main Plugin Interface ───────────────────────────
export interface ModulePlugin {
  // ── Metadata ──
  /** Unique module ID, e.g. 'product', 'order', 'livestream' */
  id: string;
  /** Display name */
  name: string;
  /** Semantic version */
  version: string;
  /** Human-readable description */
  description?: string;
  /** Other module IDs this module depends on */
  dependencies?: string[];
  /** Whether this module is required (core modules cannot be disabled) */
  required?: boolean;

  // ── Database ──
  schema?: ModuleSchema;

  // ── API Routes ──
  registerRoutes?: (t: ReturnType<TRPCBuilder['router']>) => AnyRouter;

  // ── Event Subscriptions ──
  subscribe?: {
    events: string[];
    handler: EventHandler;
  }[];

  // ── Hook Registrations ──
  hooks?: {
    name: string;
    handler: HookHandler;
  }[];

  // ── UI Registrations ──
  ui?: {
    navigation?: NavigationItem[];
    slots?: SlotRegistration[];
    /** Custom page routes this module adds */
    pages?: {
      path: string;
      component: ComponentType;
      auth?: boolean;
    }[];
  };

  // ── Integrations ──
  integrations?: IntegrationConfig[];

  // ── Lifecycle ──
  /** Called when module is loaded */
  onInit?: () => Promise<void>;
  /** Called when module is unloaded */
  onDestroy?: () => Promise<void>;
}

// ─── Plugin Manifest (for registration) ──────────────
export interface PluginManifest {
  plugin: ModulePlugin;
  /** Absolute path to module directory */
  path: string;
  /** Whether the module is currently enabled */
  enabled: boolean;
  /** Load timestamp */
  loadedAt?: Date;
  /** Any error from loading */
  loadError?: string;
}
