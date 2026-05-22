# FormIO Dynamic Forms — React

Drag-and-drop form builder using `@formio/react` with proper field name resolution.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Stack

- `@formio/react` — FormBuilder (admin, drag-and-drop) + Form (user renderer)
- `@formio/js` — core formio engine (peer dependency)
- `vite` + `react 18`

## How it works

### Admin Builder (`AdminBuilder.jsx`)
Uses `<FormBuilder>` from `@formio/react`. Admin drags fields, configures labels/options/validation. Clicking **Publish** saves the JSON schema.

### User Form (`UserForm.jsx`)
Uses `<Form>` from `@formio/react`. Receives the JSON schema and renders a fully working form with built-in validation, conditional fields, file upload, datagrid rows, etc.

### Field Name Resolution (`utils/resolveAnswers.js`)
Formio submission data looks like:
```json
{ "data": { "fullName": "John", "department": "engineering" } }
```

`resolveAnswers()` maps:
- `fullName` → "Full Name" (label from schema)
- `"engineering"` → "Engineering" (option label from schema)
- `projectHistory` array of row objects → keyed by **column labels** not indices

This is the production pattern: SQL stores raw `submission.data` in the `answers` JSON column. The app layer calls `resolveAnswers()` to produce human-readable output for display, export, and reports.

### MySQL Storage
```sql
-- Raw submission goes here:
INSERT INTO form_responses (form_id, answers)
VALUES (1, '{"fullName":"John","department":"engineering",...}');

-- Resolved on read in Node.js:
const fields = resolveAnswers(schema.components, row.answers);
```

## Field types supported (via formio)
- Text field, Email, Phone, Number, Password
- Textarea
- Radio, Select, Selectboxes (multi-select), Checkbox
- Date/Time, Day
- File upload
- DataGrid (table with dynamic rows)
- Columns, Panel, Fieldset, Tabs
- Conditional visibility (show field when another = value)
- Built-in validation (required, min/max, regex, custom)
