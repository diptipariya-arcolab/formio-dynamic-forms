import { useState } from "react";
import AdminBuilder from "./components/AdminBuilder";
import UserForm from "./components/UserForm";
import ResponseViewer from "./components/ResponseViewer";
import "./styles.css";
const TABS = [
  { id: "builder", label: "⚙ Admin Builder" },
  { id: "form", label: "📋 User Form" },
  { id: "responses", label: "📊 Responses" },
];

export default function App() {
  const [tab, setTab] = useState("builder");
  const [schema, setSchema] = useState(null);
  const [responses, setResponses] = useState([]);

  const handlePublish = (schema) => {
    setSchema(schema);
    setTab("form");
  };

  const handleSubmit = (payload) => {
    setResponses((prev) => [...prev, payload]);
    setTab("responses");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span>FormIO Builder</span>
          </div>
          <nav className="tab-nav">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.id === "responses" && responses.length > 0 && (
                  <span className="count-badge">{responses.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {tab === "builder" && <AdminBuilder onPublish={handlePublish} />}
        {tab === "form" && <UserForm schema={schema} onSubmit={handleSubmit} />}
        {tab === "responses" && (
          <ResponseViewer responses={responses} schema={schema} />
        )}
      </main>
    </div>
  );
}
