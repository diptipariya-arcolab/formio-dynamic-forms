import { useState } from 'react'
import { Form } from '@formio/react'
import { buildStoragePayload } from '../utils/resolveAnswers'

export default function UserForm({ schema, onSubmit }) {
  const [submitted, setSubmitted] = useState(false)
  const [lastPayload, setLastPayload] = useState(null)

  if (!schema) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p>No form published yet.</p>
        <p className="empty-sub">Go to Admin Builder, design your form, and click Publish.</p>
      </div>
    )
  }

  const handleSubmit = (submission) => {
    /**
     * submission.data = { fullName: "John", department: "engineering", ... }
     *
     * buildStoragePayload does two things:
     *  1. rawData       → goes into MySQL answers JSON column as-is
     *  2. resolvedFields → app layer maps keys→labels, values→labels (e.g. "engineering" → "Engineering")
     */
    const payload = buildStoragePayload(submission, schema)
    setLastPayload(payload)
    setSubmitted(true)
    onSubmit(payload)
  }

  if (submitted) {
    return (
      <div className="submit-success">
        <div className="success-icon">✓</div>
        <h2>Submitted successfully!</h2>
        <p>Your response has been recorded. Check the Responses tab.</p>

        <div className="payload-preview">
          <div className="payload-tabs">
            <span className="payload-tab-label">What gets stored in MySQL <code>answers</code> column:</span>
          </div>
          <pre>{JSON.stringify(lastPayload?.rawData, null, 2)}</pre>
        </div>

        <button
          className="btn-secondary"
          onClick={() => { setSubmitted(false); setLastPayload(null) }}
        >
          Submit another response
        </button>
      </div>
    )
  }

  return (
    <div className="user-form-wrap">
      <div className="form-header">
        <h1 className="form-title">{schema.title}</h1>
        <span className="form-version">v{schema.version}</span>
      </div>

      {/*
        Formio <Form> component renders the full form from the JSON schema.
        It handles:
        - All field types (text, radio, select, datagrid, file, etc.)
        - Conditional visibility (show field when another field = value)
        - Built-in validation (required, min/max, regex, etc.)
        - File uploads (base64 for local, S3 for production)
      */}
      <div className="formio-render-wrap">
        <Form
          form={schema}
          onSubmit={handleSubmit}
          options={{
            noAlerts: false,
            readOnly: false,
          }}
        />
      </div>
    </div>
  )
}
