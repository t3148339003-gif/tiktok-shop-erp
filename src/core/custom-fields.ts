/**
 * Custom Fields Engine — User-extensible data model without schema changes.
 *
 * Entity-Attribute-Value (EAV) pattern:
 *   Entity: 'product', 'order', 'customer', 'supplier'
 *   Attribute: field definition (name, type, options)
 *   Value: actual value for a specific entity instance
 *
 * Usage:
 *   // Define a field
 *   await CustomFields.defineField('product', 'hsCode', 'text', '海关编码')
 *
 *   // Set a value
 *   await CustomFields.setValue('product', 'prod_123', 'hsCode', '6204.62')
 *
 *   // Get all custom field values for an entity
 *   const fields = await CustomFields.getValues('product', 'prod_123')
 *   // { hsCode: '6204.62', expiryDate: '2026-12-31' }
 */

// ─── Types ───────────────────────────────────────────
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'url';
export type EntityType = 'product' | 'order' | 'customer' | 'supplier' | 'shop';

export interface FieldDefinition {
  id: string;
  entity: EntityType;
  fieldName: string;
  fieldType: FieldType;
  label: string;
  /** For 'select' type: comma-separated options */
  options?: string;
  required: boolean;
  /** Display order */
  order: number;
  createdAt: Date;
}

export interface FieldValue {
  fieldId: string;
  entityId: string;
  value: string;
}

// ─── In-memory store (backed by DB in production) ───
// In production, this would use Prisma to read/write the CustomField
// and CustomFieldValue tables.
// For Phase 0, we use an in-memory implementation so the core
// framework can be tested without a database.

class CustomFieldsEngine {
  private fieldDefs: Map<string, FieldDefinition> = new Map();
  private fieldValues: Map<string, string> = new Map(); // key: "entityType:entityId:fieldName"

  /**
   * Define a new custom field for an entity type.
   */
  defineField(
    entity: EntityType,
    fieldName: string,
    fieldType: FieldType,
    label: string,
    options?: { required?: boolean; selectOptions?: string[]; order?: number },
  ): FieldDefinition {
    const id = `${entity}:${fieldName}`;
    const def: FieldDefinition = {
      id,
      entity,
      fieldName,
      fieldType,
      label,
      options: options?.selectOptions?.join(','),
      required: options?.required ?? false,
      order: options?.order ?? 100,
      createdAt: new Date(),
    };
    this.fieldDefs.set(id, def);
    return def;
  }

  /**
   * Get all field definitions for an entity type.
   */
  getFieldDefinitions(entity: EntityType): FieldDefinition[] {
    return Array.from(this.fieldDefs.values())
      .filter((f) => f.entity === entity)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Remove a field definition.
   */
  removeField(entity: EntityType, fieldName: string): void {
    const id = `${entity}:${fieldName}`;
    this.fieldDefs.delete(id);
    // Also remove all values for this field
    const prefix = `${entity}:`;
    for (const [key] of this.fieldValues) {
      if (key.includes(`:${fieldName}`)) {
        this.fieldValues.delete(key);
      }
    }
  }

  /**
   * Set a custom field value for an entity instance.
   */
  setValue(entity: EntityType, entityId: string, fieldName: string, value: string): void {
    const key = `${entity}:${entityId}:${fieldName}`;
    this.fieldValues.set(key, value);
  }

  /**
   * Get a single custom field value.
   */
  getValue(entity: EntityType, entityId: string, fieldName: string): string | undefined {
    const key = `${entity}:${entityId}:${fieldName}`;
    return this.fieldValues.get(key);
  }

  /**
   * Get all custom field values for an entity instance.
   */
  getValues(entity: EntityType, entityId: string): Record<string, string> {
    const result: Record<string, string> = {};
    const prefix = `${entity}:${entityId}:`;
    for (const [key, value] of this.fieldValues) {
      if (key.startsWith(prefix)) {
        const fieldName = key.slice(prefix.length);
        result[fieldName] = value;
      }
    }
    return result;
  }

  /**
   * Bulk set values for an entity instance.
   */
  setValues(entity: EntityType, entityId: string, values: Record<string, string>): void {
    for (const [fieldName, value] of Object.entries(values)) {
      this.setValue(entity, entityId, fieldName, value);
    }
  }

  /**
   * Delete all custom field values for an entity instance.
   */
  deleteValues(entity: EntityType, entityId: string): void {
    const prefix = `${entity}:${entityId}:`;
    for (const key of this.fieldValues.keys()) {
      if (key.startsWith(prefix)) {
        this.fieldValues.delete(key);
      }
    }
  }

  /**
   * Validate required fields are filled for an entity instance.
   * Returns array of missing required field names.
   */
  validate(entity: EntityType, entityId: string): string[] {
    const missing: string[] = [];
    const defs = this.getFieldDefinitions(entity);
    for (const def of defs) {
      if (def.required) {
        const val = this.getValue(entity, entityId, def.fieldName);
        if (!val || val.trim() === '') {
          missing.push(def.label);
        }
      }
    }
    return missing;
  }

  /** Clear all data (for testing) */
  clear(): void {
    this.fieldDefs.clear();
    this.fieldValues.clear();
  }
}

/** Global singleton */
export const CustomFields = new CustomFieldsEngine();
