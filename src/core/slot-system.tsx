/**
 * Slot System — Dynamic UI injection points.
 *
 * Pages define named <Slot> components.
 * Modules register components to fill those slots.
 * The SlotRenderer pulls it all together.
 *
 * Usage:
 *   // In a page:
 *   <Slot name="dashboard::overview-top" shopId={shopId} />
 *
 *   // In a module's index.ts:
 *   ui: {
 *     slots: [{
 *       slot: 'dashboard::overview-top',
 *       component: LiveMetricsCard,
 *       priority: 50
 *     }]
 *   }
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { PluginRegistry } from './plugin-registry';
import type { SlotRegistration } from './plugin-interface';

// ─── Slot Context ────────────────────────────────────
const SlotContext = createContext<Record<string, unknown>>({});

export function SlotProvider({
  children,
  context = {},
}: {
  children: React.ReactNode;
  context?: Record<string, unknown>;
}) {
  return <SlotContext.Provider value={context}>{children}</SlotContext.Provider>;
}

export function useSlotContext(): Record<string, unknown> {
  return useContext(SlotContext);
}

// ─── Slot Component ──────────────────────────────────

interface SlotProps {
  /** Slot name, e.g. 'dashboard::overview-top' */
  name: string;
  /** Props passed to each rendered component */
  context?: Record<string, unknown>;
  /** Fallback when no modules registered for this slot */
  fallback?: React.ReactNode;
  /** CSS class for the slot wrapper */
  className?: string;
}

export function Slot({ name, context = {}, fallback = null, className }: SlotProps) {
  const slotContext = useSlotContext();
  const mergedContext = { ...slotContext, ...context };

  const registrations = useMemo(() => {
    // Client-side only
    if (typeof window === 'undefined') return [];
    try {
      return PluginRegistry.getSlots(name);
    } catch {
      return [];
    }
  }, [name]);

  if (registrations.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <div className={className} data-slot={name}>
      {registrations.map((reg, i) => (
        <SlotRenderer key={`${reg.slot}-${i}`} registration={reg} context={mergedContext} />
      ))}
    </div>
  );
}

// ─── Slot Renderer ───────────────────────────────────

function SlotRenderer({
  registration,
  context,
}: {
  registration: SlotRegistration;
  context: Record<string, unknown>;
}) {
  const Comp = registration.component;

  try {
    return <Comp {...context} />;
  } catch (err) {
    console.error(`[SlotSystem] Error rendering slot "${registration.slot}":`, err);
    return null;
  }
}

// ─── Slot Definitions (all available slot points) ───

/**
 * All known slot points in the application.
 * Modules can inject into any of these.
 * New slots can be added here as the app grows.
 */
export const SLOT_DEFINITIONS = {
  // Dashboard
  'dashboard::overview-top': {
    name: 'dashboard::overview-top',
    description: 'Top of dashboard overview page',
    defaultPriority: 100,
  },
  'dashboard::charts-left': {
    name: 'dashboard::charts-left',
    description: 'Left chart area on dashboard',
    defaultPriority: 100,
  },
  'dashboard::charts-right': {
    name: 'dashboard::charts-right',
    description: 'Right chart area on dashboard',
    defaultPriority: 100,
  },
  'dashboard::bottom': {
    name: 'dashboard::bottom',
    description: 'Bottom of dashboard page',
    defaultPriority: 100,
  },

  // Product
  'product::detail-panel': {
    name: 'product::detail-panel',
    description: 'Right panel on product detail page',
    defaultPriority: 100,
  },
  'product::below-skus': {
    name: 'product::below-skus',
    description: 'Below SKU table on product detail',
    defaultPriority: 100,
  },
  'product::list-actions': {
    name: 'product::list-actions',
    description: 'Extra actions in product list toolbar',
    defaultPriority: 100,
  },

  // Order
  'order::detail-panel': {
    name: 'order::detail-panel',
    description: 'Right panel on order detail page',
    defaultPriority: 100,
  },
  'order::list-filters': {
    name: 'order::list-filters',
    description: 'Extra filters in order list',
    defaultPriority: 100,
  },

  // Settings
  'settings::panel': {
    name: 'settings::panel',
    description: 'Extra settings panels',
    defaultPriority: 100,
  },

  // Global
  'global::header-actions': {
    name: 'global::header-actions',
    description: 'Extra buttons in global header',
    defaultPriority: 100,
  },
} as const;

export type SlotName = keyof typeof SLOT_DEFINITIONS;
