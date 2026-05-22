/**
 * resolveAnswers.js
 *
 * Formio stores submissions as { data: { fieldKey: value } }
 * where fieldKey is whatever the admin set as the API key (e.g. "fullName", "department").
 *
 * This utility walks the form schema components and maps each component's
 * key → label, resolving nested layouts (columns, panels, fieldsets) recursively.
 *
 * This is the production pattern: SQL stores raw submission JSON,
 * the app layer resolves keys → labels using the schema.
 */

/**
 * Flatten all leaf components from a formio schema (handles nested panels/columns)
 */
export function flattenComponents(components = []) {
  const result = []
  for (const comp of components) {
    if (['columns', 'panel', 'fieldset', 'well', 'tabs'].includes(comp.type)) {
      // recurse into nested containers
      const children = comp.columns
        ? comp.columns.flatMap((col) => flattenComponents(col.components || []))
        : flattenComponents(comp.components || [])
      result.push(...children)
    } else if (comp.type === 'button') {
      // skip buttons
    } else {
      result.push(comp)
    }
  }
  return result
}

/**
 * Resolve raw formio submission data into labelled field objects
 *
 * @param {Array}  components  - form schema components array
 * @param {Object} data        - submission.data from formio (e.g. { fullName: "John", ... })
 * @returns {Array} resolved fields: [{ key, label, type, value }]
 */
export function resolveAnswers(components, data) {
  const flat = flattenComponents(components)
  return flat
    .filter((comp) => comp.key && comp.key !== 'submit')
    .map((comp) => ({
      key:   comp.key,
      label: comp.label || comp.key,
      type:  comp.type,
      value: resolveValue(comp, data[comp.key]),
    }))
}

function resolveValue(comp, raw) {
  if (raw === undefined || raw === null || raw === '') return null

  switch (comp.type) {
    case 'textfield':
    case 'textarea':
    case 'email':
    case 'phoneNumber':
    case 'number':
    case 'password':
      return String(raw)

    case 'select':
      // formio select can store value or { label, value } depending on config
      if (typeof raw === 'object' && raw.label) return raw.label
      // map stored value back to label using component data
      if (comp.data?.values) {
        const found = comp.data.values.find((v) => v.value === raw)
        return found ? found.label : raw
      }
      return raw

    case 'radio':
      // map stored value back to label
      if (comp.values) {
        const found = comp.values.find((v) => v.value === raw)
        return found ? found.label : raw
      }
      return raw

    case 'selectboxes':
      // raw = { "option_value": true/false, ... }
      // map to array of selected labels
      if (typeof raw === 'object') {
        const selected = Object.entries(raw)
          .filter(([, checked]) => checked)
          .map(([val]) => {
            const found = comp.values?.find((v) => v.value === val)
            return found ? found.label : val
          })
        return selected.length ? selected : null
      }
      return raw

    case 'checkbox':
      return raw === true ? 'Yes' : 'No'

    case 'file':
      if (Array.isArray(raw)) return raw.map((f) => f.originalName || f.name || f.url)
      return raw

    case 'datagrid':
      // datagrid: array of row objects keyed by sub-component keys
      // resolve each row using datagrid's components as sub-schema
      if (Array.isArray(raw)) {
        return raw.map((row) => resolveDatagridRow(comp.components || [], row))
      }
      return raw

    case 'datetime':
    case 'day':
      return raw

    default:
      return raw
  }
}

/**
 * Resolve a single datagrid row — maps sub-component keys to labels
 */
function resolveDatagridRow(components, rowData) {
  const resolved = {}
  for (const comp of components) {
    if (comp.type === 'button') continue
    const label = comp.label || comp.key
    resolved[label] = resolveValue(comp, rowData[comp.key])
  }
  return resolved
}

/**
 * Build a clean object for MySQL storage:
 * strips formio metadata, keeps only data keys
 */
export function buildStoragePayload(submission, schema) {
  return {
    formId:       schema.id || null,
    formTitle:    schema.title || '',
    submittedAt:  new Date().toISOString(),
    // raw answers exactly as formio produces — goes into MySQL answers JSON column
    rawData:      submission.data,
    // resolved: what your app layer serves to UI / export / reports
    resolvedFields: resolveAnswers(schema.components || [], submission.data),
  }
}
