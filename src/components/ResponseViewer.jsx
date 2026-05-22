import { useState } from 'react'

export default function ResponseViewer({ responses, schema }) {
  const [selected, setSelected] = useState(0)

  if (!responses || responses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p>No responses yet.</p>
        <p className="empty-sub">Fill and submit the User Form to see responses here.</p>
      </div>
    )
  }

  const response = responses[selected]

  return (
    <div className="response-viewer">
      {/* Sidebar */}
      <div className="response-sidebar">
        <div className="sidebar-header">Responses ({responses.length})</div>
        {responses.map((r, i) => (
          <button
            key={r.submittedAt + i}
            className={`sidebar-item ${selected === i ? 'active' : ''}`}
            onClick={() => setSelected(i)}
          >
            <span className="resp-num">#{i + 1}</span>
            <span className="resp-time">
              {new Date(r.submittedAt).toLocaleTimeString()}
            </span>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="response-detail">
        <div className="response-meta">
          <span className="meta-label">Response #{selected + 1}</span>
          <span className="meta-dot">·</span>
          <span>{new Date(response.submittedAt).toLocaleString()}</span>
          {schema && (
            <>
              <span className="meta-dot">·</span>
              <span>{response.formTitle}</span>
            </>
          )}
        </div>

        {/* Resolved fields — proper field labels, proper option labels */}
        <div className="resolved-section">
          <div className="section-label">Resolved Fields (App Layer)</div>
          <div className="resolved-fields">
            {response.resolvedFields.map((field) => (
              <div key={field.key} className="resolved-field">
                <div className="field-header">
                  <span className="field-label">{field.label}</span>
                  <span className="field-type-badge">{field.type}</span>
                  <span className="field-key-badge">{field.key}</span>
                </div>
                <div className="field-value">
                  <FieldValue field={field} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw MySQL storage */}
        <details className="raw-section">
          <summary>
            Raw MySQL <code>answers</code> JSON — what's stored in DB
          </summary>
          <pre>{JSON.stringify(response.rawData, null, 2)}</pre>
        </details>

        {/* Full resolved payload */}
        <details className="raw-section">
          <summary>Full resolved payload (app layer output)</summary>
          <pre>{JSON.stringify(response.resolvedFields, null, 2)}</pre>
        </details>
      </div>
    </div>
  )
}

function FieldValue({ field }) {
  const { value, type } = field

  if (value === null || value === undefined) {
    return <span className="null-value">— not answered —</span>
  }

  // Selectboxes / multiselect → array of labels
  if (type === 'selectboxes' && Array.isArray(value)) {
    return (
      <div className="tag-row">
        {value.map((v) => <span key={v} className="tag">{v}</span>)}
      </div>
    )
  }

  // Datagrid → table with resolved column labels as headers
  if (type === 'datagrid' && Array.isArray(value)) {
    if (!value.length) return <span className="null-value">— no rows —</span>
    // headers come from resolveAnswers — Object.keys of first row are already labels
    const headers = Object.keys(value[0])
    return (
      <table className="resp-table">
        <thead>
          <tr>
            {/* These are already resolved labels — e.g. "Project Name" not "projectName" */}
            {headers.map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {value.map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h}>{row[h] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // File array
  if (type === 'file' && Array.isArray(value)) {
    return (
      <div className="file-list">
        {value.map((f, i) => (
          <span key={i} className="file-chip">📎 {f}</span>
        ))}
      </div>
    )
  }

  return <span className="plain-val">{String(value)}</span>
}
