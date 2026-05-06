"use client";

import { useState } from "react";
import { Wand2, Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/client";

interface GeneratedLesson {
  title: string;
}

interface GeneratedUnit {
  title: string;
  description: string;
  cefr_level: string;
  lessons: GeneratedLesson[];
}

export function AIUnitGenerator({ onSaved }: { onSaved: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("A1");
  const [count, setCount] = useState(1);
  const [lessonsPerUnit, setLessonsPerUnit] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedUnit[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setGenerated(null);

    try {
      const res = await fetch("/api/admin/generate-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || "General English", level, count, lessonsPerUnit }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to generate units");
      }

      const data = await res.json();
      setGenerated(data.units || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  // --- Editable lessons helpers ---
  function updateUnitField(unitIdx: number, field: keyof GeneratedUnit, value: string) {
    setGenerated((prev) =>
      prev
        ? prev.map((u, i) => (i === unitIdx ? { ...u, [field]: value } : u))
        : prev
    );
  }

  function addLesson(unitIdx: number) {
    setGenerated((prev) =>
      prev
        ? prev.map((u, i) =>
            i === unitIdx
              ? { ...u, lessons: [...u.lessons, { title: "" }] }
              : u
          )
        : prev
    );
  }

  function updateLesson(unitIdx: number, lessonIdx: number, field: keyof GeneratedLesson, value: string) {
    setGenerated((prev) =>
      prev
        ? prev.map((u, i) =>
            i === unitIdx
              ? {
                  ...u,
                  lessons: u.lessons.map((l, li) =>
                    li === lessonIdx ? { ...l, [field]: value } : l
                  ),
                }
              : u
          )
        : prev
    );
  }

  function removeLesson(unitIdx: number, lessonIdx: number) {
    setGenerated((prev) =>
      prev
        ? prev.map((u, i) =>
            i === unitIdx
              ? { ...u, lessons: u.lessons.filter((_, li) => li !== lessonIdx) }
              : u
          )
        : prev
    );
  }

  const handleSave = async () => {
    if (!generated || generated.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // determine current max order_index so new units are appended
      const { data: lastRows } = await supabase
        .from("units")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const baseIndex = (Array.isArray(lastRows) && lastRows.length > 0 && (lastRows[0] as any).order_index)
        ? (lastRows[0] as any).order_index
        : 0;

      for (let gi = 0; gi < generated.length; gi++) {
        const unit = generated[gi];
        const unitId = (typeof crypto !== "undefined" && "randomUUID" in crypto)
          ? (crypto as any).randomUUID()
          : `unit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const order_index = baseIndex + gi + 1;

        const { error: unitError } = await supabase
          .from("units")
          .insert({ id: unitId, title: unit.title, description: unit.description, cefr_level: unit.cefr_level, is_published: true, order_index });

        if (unitError) throw unitError;

        // Filter out empty lessons before saving
        const validLessons = unit.lessons.filter((l) => l.title.trim() !== "");
        if (unitId && validLessons.length > 0) {
          const lessonRows = validLessons.map((l, idx) => ({
            id: crypto.randomUUID(),
            unit_id: unitId,
            title: l.title,
            order_index: idx + 1,
          }));

          const { error: lessonsError } = await supabase.from("lessons").insert(lessonRows);
          if (lessonsError) {
            // attempt to continue but surface error
            console.warn("Failed to insert lessons for unit", lessonsError);
          }
        }
      }

      setGenerated(null);
      setTopic("");
      setLevel("A1");
      setCount(1);
      setLessonsPerUnit(3);
      setIsOpen(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
      >
        <Wand2 className="w-4 h-4" />
        AI Generate Unit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1B1D24] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Units with AI</h2>
              <button onClick={() => setIsOpen(false)} title="Close modal" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            {!generated ? (
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Travel, Workplace, Daily Routines"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0F1729] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">CEFR Level</label>
                    <select aria-label="CEFR level" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border">
                      {['A1','A2','B1','B2','C1','C2'].map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Units</label>
                    <input type="number" min={1} max={3} value={count} onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value)||1,1),3))} className="w-full px-3 py-2 rounded-lg border" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Lessons / Unit</label>
                    <input type="number" min={1} max={6} value={lessonsPerUnit} onChange={(e) => setLessonsPerUnit(Math.min(Math.max(parseInt(e.target.value)||3,1),6))} className="w-full px-3 py-2 rounded-lg border" />
                  </div>
                </div>

                {error && <div className="p-3 bg-red-100 rounded text-sm text-red-700">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={generating} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2">
                    {generating ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating...</> : <><Wand2 className="w-4 h-4"/> Generate Units</>}
                  </button>
                  <button onClick={() => setIsOpen(false)} type="button" className="px-4 py-2 border rounded-lg">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                  Generated {generated.length} unit(s) — you can edit the lessons below before saving.
                </div>

                <div className="space-y-4 max-h-[55vh] overflow-y-auto">
                  {generated.map((u, unitIdx) => (
                    <div key={unitIdx} className="p-4 bg-gray-50 dark:bg-[#0F1729] border rounded-lg space-y-3">
                      {/* Unit header - editable */}
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={u.title}
                          onChange={(e) => updateUnitField(unitIdx, "title", e.target.value)}
                          className="w-full px-3 py-1.5 text-sm font-semibold rounded-md border border-input bg-background"
                          placeholder="Unit title"
                        />
                        <input
                          type="text"
                          value={u.description}
                          onChange={(e) => updateUnitField(unitIdx, "description", e.target.value)}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background"
                          placeholder="Unit description"
                        />
                        <p className="text-xs text-muted-foreground">CEFR: {u.cefr_level}</p>
                      </div>

                      {/* Lessons - editable */}
                      <div className="border-t border-border pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Lessons ({u.lessons.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => addLesson(unitIdx)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        </div>
                        {u.lessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            No lessons. Click &quot;Add&quot; to create one.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {u.lessons.map((l, lessonIdx) => (
                              <div key={lessonIdx} className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-medium shrink-0">
                                  {lessonIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={l.title}
                                  onChange={(e) =>
                                    updateLesson(unitIdx, lessonIdx, "title", e.target.value)
                                  }
                                  placeholder="Lesson title"
                                  className="flex-1 h-7 px-2 text-xs rounded-md border border-input bg-background"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeLesson(unitIdx, lessonIdx)}
                                  className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                                  title="Remove lesson"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {error && <div className="p-3 bg-red-100 rounded text-sm text-red-700">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <button onClick={() => { setGenerated(null); setError(null); }} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Generate Again</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : <><Save className="w-4 h-4"/> Save Units</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
