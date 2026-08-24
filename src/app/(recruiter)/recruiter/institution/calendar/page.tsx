"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Plus, Trash2, X } from "lucide-react";
import { institutionService } from "@/features/institution/services/institutionService";
import { CreateEventInput, InstitutionEvent, InstitutionEventType } from "@/features/institution/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_LABEL: Record<InstitutionEventType, string> = {
  interview_drive: "Interview Drive",
  aptitude_test: "Aptitude Test",
  campus_visit: "Campus Visit",
  meeting: "Meeting",
  other: "Other",
};

const emptyForm: CreateEventInput = { title: "", date: "", type: "other", notes: "" };

export default function InstitutionCalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<InstitutionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateEventInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback((y: number, m: number) => {
    setLoading(true);
    setError(null);
    institutionService
      .getEvents(y, m + 1)
      .then(setEvents)
      .catch(() => setError("Unable to load events. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(year, month);
  }, [year, month, load]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.date) {
      setFormError("Title and date are required.");
      return;
    }
    setSaving(true);
    try {
      await institutionService.addEvent(form);
      setForm(emptyForm);
      setShowForm(false);
      load(year, month);
    } catch (err: unknown) {
      setFormError((err as { message?: string })?.message || "Failed to add event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this event?")) return;
    try {
      await institutionService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      setError("Failed to remove event. Please try again.");
    }
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = now.toISOString().slice(0, 10);

  const eventsByDay = new Map<number, InstitutionEvent[]>();
  for (const ev of events) {
    const d = new Date(ev.date).getDate();
    const list = eventsByDay.get(d) || [];
    list.push(ev);
    eventsByDay.set(d, list);
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Calendar</h1>
          <p className="text-ink-soft mt-1 text-sm">Interview drives, aptitude tests and placement events.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 text-xs font-semibold bg-gradient-brand text-primary-foreground px-4 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Event
        </button>
      </div>

      {error && <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-surface-alt text-ink-soft hover:text-ink transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-ink text-sm">{MONTH_NAMES[month]} {year}</span>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-surface-alt text-ink-soft hover:text-ink transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-ink-soft py-1">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dateStr = new Date(year, month, day).toISOString().slice(0, 10);
              const isToday = dateStr === todayStr;
              const dayEvents = eventsByDay.get(day) || [];
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-xl border p-1.5 text-xs flex flex-col items-center justify-center gap-0.5 ${
                    isToday ? "bg-gradient-brand text-primary-foreground border-transparent font-bold" : "border-border text-ink"
                  }`}
                >
                  <span>{day}</span>
                  {dayEvents.length > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-primary-foreground" : "bg-primary-glow"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-5 sm:p-6">
        <h2 className="text-sm font-bold text-ink mb-4">Events this month</h2>
        {!loading && events.length === 0 ? (
          <p className="text-sm text-ink-soft text-center py-6">No upcoming placement events.</p>
        ) : (
          <div className="divide-y divide-border">
            {events
              .slice()
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((ev) => (
                <div key={ev._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{ev.title}</div>
                    <div className="text-[11px] text-ink-soft mt-0.5">
                      {new Date(ev.date).toLocaleDateString()} · {TYPE_LABEL[ev.type]}
                      {ev.notes ? ` · ${ev.notes}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ev._id)}
                    className="text-ink-soft hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/5 transition shrink-0"
                    aria-label="Remove event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary-glow" /> Add Event
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-3.5">
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-1.5">Title *</span>
                <input className="input-base" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-1.5">Date *</span>
                <input type="date" className="input-base" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-1.5">Type</span>
                <select className="input-base" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InstitutionEventType })}>
                  {Object.entries(TYPE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-1.5">Notes</span>
                <textarea className="input-base min-h-[70px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </label>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-ink-soft hover:text-ink rounded-xl transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
