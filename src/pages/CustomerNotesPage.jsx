import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { createCrmCustomerNote, getCrmCustomerNotes } from "../services/crmService";

function CustomerNotesPage() {
  const { customer } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCrmCustomerNotes(customer.id);
      setNotes(response.notes || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load CRM notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [customer.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await createCrmCustomerNote(customer.id, noteText);

      setNotes((current) => [response.note, ...current].filter(Boolean));
      setNoteText("");
      setMessage("CRM note added successfully");
    } catch (apiError) {
      setError(apiError.message || "Failed to save CRM note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <StatusBanner tone="success">{message}</StatusBanner>
        <StatusBanner tone="danger">{error}</StatusBanner>

        <form onSubmit={handleSubmit} className="rounded-card bg-canvas p-5">
          <p className="ui-eyebrow">Customer Notes</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Add internal note</h2>

          <div className="mt-5">
            <label className="ui-label">CRM Note</label>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows="7"
              required
              className="ui-input min-h-[180px] resize-none"
              placeholder={`Capture service context, follow-ups, or buying preferences for ${customer.name}`}
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="mt-4 w-full !text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            {saving ? "Saving..." : "Save CRM Note"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? <p className="text-sm text-secondary">Loading CRM notes...</p> : null}

        {!loading && !notes.length ? (
          <EmptyState
            title="No notes yet"
            description="The team has not added any internal CRM notes for this customer yet."
          />
        ) : null}

        {notes.length ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="rounded-card bg-canvas p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-ink">{note.author_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  {note.author_email ? <p className="text-sm text-secondary">{note.author_email}</p> : null}
                </div>

                <p className="mt-4 text-sm leading-7 text-secondary">{note.note_text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CustomerNotesPage;
