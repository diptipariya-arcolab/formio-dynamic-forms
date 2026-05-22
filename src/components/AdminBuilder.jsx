import { useState, useRef } from "react";
import { FormBuilder } from "@formio/react";

// Starter schema shown in builder by default
const STARTER_SCHEMA = {
  display: "form",
  components: [],
};

export default function AdminBuilder({ onPublish }) {
  const [schema, setSchema] = useState(STARTER_SCHEMA);
  const [formTitle, setFormTitle] = useState("Employee Onboarding Form");
  const [published, setPublished] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleChange = (updatedSchema) => {
    setSchema(updatedSchema);
    setPublished(false);
  };

  const handlePublish = () => {
    const finalSchema = {
      ...schema,
      id: crypto.randomUUID(),
      title: formTitle,
      version: 1,
    };
    setPublished(true);
    onPublish(finalSchema);
  };

  return (
    <div className="admin-builder">
      <div className="builder-topbar">
        <div className="builder-title-row">
          <input
            className="form-title-input"
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              setPublished(false);
            }}
            placeholder="Form Title"
          />
          <div className="builder-actions">
            <button
              className="btn-ghost"
              onClick={() => setShowJson((v) => !v)}
            >
              {showJson ? "Hide Schema" : "View JSON Schema"}
            </button>
            <button className="btn-primary" onClick={handlePublish}>
              {published ? "✓ Published" : "Publish Form →"}
            </button>
          </div>
        </div>
        {published && (
          <p className="publish-notice">
            ✓ Form published! Switch to the <strong>User Form</strong> tab to
            fill it.
          </p>
        )}
      </div>

      {/* Formio drag-and-drop builder */}
      <div className="formio-builder-wrap">
        <FormBuilder
          form={schema}
          onChange={handleChange}
          options={{
            builder: {
              basic: {
                title: "Basic Fields",
                default: true,
                weight: 0,
                components: {
                  textfield: true,
                  textarea: true,
                  number: true,
                  password: true,
                  checkbox: true,
                  selectboxes: true,
                  select: true,
                  radio: true,
                  email: true,
                  phoneNumber: true,
                  datetime: true,
                  day: true,
                  file: true,
                },
              },
              advanced: {
                title: "Advanced",
                weight: 10,
                components: {
                  datagrid: true,
                  columns: true,
                  fieldset: true,
                  panel: true,
                  table: true,
                  tabs: true,
                  well: true,
                  htmlelement: true,
                  content: true,
                },
              },
              // remove the layout/data/premium categories we don't need
              layout: false,
              data: false,
              premium: false,
            },
          }}
        />
      </div>

      {/* JSON schema preview */}
      {showJson && (
        <div className="json-preview">
          <div className="json-preview-header">
            <span>
              JSON Schema — stored in MySQL{" "}
              <code>form_versions.fields_json</code>
            </span>
            <button
              className="btn-ghost btn-sm"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
              }
            >
              Copy
            </button>
          </div>
          <pre>{JSON.stringify(schema, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
