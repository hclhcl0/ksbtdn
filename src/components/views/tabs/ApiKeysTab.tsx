"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

export default function ApiKeysTab() {
  const [geminiKeys, setGeminiKeys] = useState<any[]>([]);
  const [geminiKeysLoading, setGeminiKeysLoading] = useState(true);
  const [newGeminiLabel, setNewGeminiLabel] = useState("");
  const [newGeminiKey, setNewGeminiKey] = useState("");
  const [showNewGeminiKey, setShowNewGeminiKey] = useState(false);
  const [addingGeminiKey, setAddingGeminiKey] = useState(false);
  const [geminiKeyMsg, setGeminiKeyMsg] = useState<{type: string, text: string} | null>(null);

  const [groqKeys, setGroqKeys] = useState<any[]>([]);
  const [groqKeysLoading, setGroqKeysLoading] = useState(true);
  const [newGroqLabel, setNewGroqLabel] = useState("");
  const [newGroqKey, setNewGroqKey] = useState("");
  const [showNewGroqKey, setShowNewGroqKey] = useState(false);
  const [addingGroqKey, setAddingGroqKey] = useState(false);
  const [groqKeyMsg, setGroqKeyMsg] = useState<{type: string, text: string} | null>(null);

  const fetchGeminiKeys = async () => {
    try {
      const res = await fetch("/api/settings/gemini-keys");
      const json = await res.json();
      if (json.success) setGeminiKeys(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGeminiKeysLoading(false);
    }
  };

  const fetchGroqKeys = async () => {
    try {
      const res = await fetch("/api/settings/groq-keys");
      const json = await res.json();
      if (json.success) setGroqKeys(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGroqKeysLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiKeys();
    fetchGroqKeys();
  }, []);

  const handleAddGeminiKey = async () => {
    if (!newGeminiLabel.trim() || !newGeminiKey.trim()) {
      setGeminiKeyMsg({ type: "error", text: "Vui lòng nhập cả tên gợi nhớ và API Key." });
      return;
    }
    setAddingGeminiKey(true);
    setGeminiKeyMsg(null);
    try {
      const res = await fetch("/api/settings/gemini-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newGeminiLabel, apiKey: newGeminiKey }),
      });
      const json = await res.json();
      if (json.success) {
        setGeminiKeyMsg({ type: "success", text: "Đã thêm API Key thành công!" });
        setNewGeminiLabel("");
        setNewGeminiKey("");
        fetchGeminiKeys();
      } else {
        setGeminiKeyMsg({ type: "error", text: json.error || "Thêm key thất bại" });
      }
    } catch (e) {
      setGeminiKeyMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setAddingGeminiKey(false);
    }
  };

  const handleToggleGeminiKey = async (id: number, isActive: boolean) => {
    try {
      await fetch("/api/settings/gemini-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchGeminiKeys();
    } catch (e) { console.error(e); }
  };

  const handleDeleteGeminiKey = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa API Key này không?")) return;
    const res = await fetch(`/api/settings/gemini-keys?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchGeminiKeys();
    } else {
      alert("Lỗi: " + json.error);
    }
  };

  const handleAddGroqKey = async () => {
    if (!newGroqLabel.trim() || !newGroqKey.trim()) {
      setGroqKeyMsg({ type: "error", text: "Vui lòng nhập cả tên gợi nhớ và API Key." });
      return;
    }
    setAddingGroqKey(true);
    setGroqKeyMsg(null);
    try {
      const res = await fetch("/api/settings/groq-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newGroqLabel, apiKey: newGroqKey }),
      });
      const json = await res.json();
      if (json.success) {
        setGroqKeyMsg({ type: "success", text: "Đã thêm Groq Key thành công!" });
        setNewGroqLabel("");
        setNewGroqKey("");
        fetchGroqKeys();
      } else {
        setGroqKeyMsg({ type: "error", text: json.error || "Thêm key thất bại" });
      }
    } catch (e) {
      setGroqKeyMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setAddingGroqKey(false);
    }
  };

  const handleToggleGroqKey = async (id: number, isActive: boolean) => {
    try {
      await fetch("/api/settings/groq-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchGroqKeys();
    } catch (e) { console.error(e); }
  };

  const handleDeleteGroqKey = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa Groq Key này không?")) return;
    const res = await fetch(`/api/settings/groq-keys?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchGroqKeys();
    } else {
      alert("Lỗi: " + json.error);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px", display: "block" }}>
        {/* Gemini Keys Section */}
        <div style={{ marginTop: "20px", borderTop: "1px solid var(--theme-elevation-150)", paddingTop: "20px" }}>
          <div style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1.1rem", color: "var(--theme-text)" }}>🔑 Google Gemini API Keys</div>
          
          <div style={{ background: "var(--theme-elevation-50)", padding: "20px", borderRadius: "12px", border: "1px solid var(--theme-elevation-150)" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontWeight: 600, marginBottom: "12px", color: "var(--theme-text)" }}>Danh sách Key hiện có (Luân phiên sử dụng)</div>
              {geminiKeysLoading ? (
                <div style={{ color: "var(--theme-text)", padding: "16px 0" }}>Đang tải...</div>
              ) : geminiKeys.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--theme-elevation-200)", borderRadius: "8px", color: "var(--theme-text)", marginBottom: "20px" }}>
                  Chưa có API Key nào được cấu hình.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {geminiKeys.map((key, idx) => (
                    <div key={key.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--theme-elevation-50)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--theme-elevation-150)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: key.isActive ? "#22c55e" : "var(--theme-elevation-200)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--theme-text)" }}>{key.label}</div>
                          <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "2px" }}>{key.maskedKey}</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "4px" }}>
                            Đã dùng: <b>{new Intl.NumberFormat().format(key.usageTokens || 0)}</b> token / <b>{key.usageCount || 0}</b> lượt
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button type="button" onClick={() => handleToggleGeminiKey(key.id, key.isActive)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: key.isActive ? "rgba(34, 197, 94, 0.15)" : "var(--theme-elevation-150)", color: key.isActive ? "#22c55e" : "var(--theme-text)" }}>{key.isActive ? "● Đang dùng" : "○ Tắt"}</span>
                        </button>
                        <button className="btn btn--style-secondary btn--size-small btn--icon" onClick={() => handleDeleteGeminiKey(key.id)} style={{ color: "#ef4444", padding: "4px 10px" }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px dashed var(--theme-elevation-200)", paddingTop: "20px" }}>
              <div style={{ fontWeight: 600, marginBottom: "12px", color: "var(--theme-text)" }}>Thêm Gemini Key mới</div>
              {geminiKeyMsg && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "1.1rem", background: geminiKeyMsg.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", border: `1px solid ${geminiKeyMsg.type === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`, color: geminiKeyMsg.type === "success" ? "#22c55e" : "#ef4444" }}>
                  {geminiKeyMsg.text}
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 30%" }}>
                  <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="VD: Gemini Key 1..." value={newGeminiLabel} onChange={(e) => setNewGeminiLabel(e.target.value)} />
                </div>
                <div style={{ flex: "1 1 70%", position: "relative" }}>
                  <input type={showNewGeminiKey ? "text" : "password"} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="AIza..." value={newGeminiKey} onChange={(e) => setNewGeminiKey(e.target.value)} style={{ paddingRight: "44px", fontFamily: "monospace" }} />
                  <button type="button" onClick={() => setShowNewGeminiKey(!showNewGeminiKey)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)" }}>{showNewGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                <button type="button" className="btn btn--style-primary" onClick={handleAddGeminiKey} disabled={addingGeminiKey} style={{ height: "46px", margin: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {addingGeminiKey ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Đang thêm...</> : <><Plus className="w-4 h-4" /> Thêm Key</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Groq Keys Section */}
        <div style={{ marginTop: "32px", borderTop: "1px solid var(--theme-elevation-150)", paddingTop: "20px" }}>
          <div style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1.1rem", color: "var(--theme-text)" }}>⚡ Groq API Keys (Llama-3)</div>
          
          <div style={{ background: "var(--theme-elevation-50)", padding: "20px", borderRadius: "12px", border: "1px solid var(--theme-elevation-150)" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontWeight: 600, marginBottom: "12px", color: "var(--theme-text)" }}>Danh sách Key hiện có (Luân phiên sử dụng)</div>
              {groqKeysLoading ? (
                <div style={{ color: "var(--theme-text)", padding: "16px 0" }}>Đang tải...</div>
              ) : groqKeys.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--theme-elevation-200)", borderRadius: "8px", color: "var(--theme-text)", marginBottom: "20px" }}>
                  Chưa có Groq API Key nào được cấu hình.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {groqKeys.map((key, idx) => (
                    <div key={key.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--theme-elevation-50)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--theme-elevation-150)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: key.isActive ? "#22c55e" : "var(--theme-elevation-200)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--theme-text)" }}>{key.label}</div>
                          <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "2px" }}>{key.maskedKey}</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "4px" }}>
                            Đã dùng: <b>{new Intl.NumberFormat().format(key.usageTokens || 0)}</b> token / <b>{key.usageCount || 0}</b> lượt
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button type="button" onClick={() => handleToggleGroqKey(key.id, key.isActive)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: key.isActive ? "rgba(34, 197, 94, 0.15)" : "var(--theme-elevation-150)", color: key.isActive ? "#22c55e" : "var(--theme-text)" }}>{key.isActive ? "● Đang dùng" : "○ Tắt"}</span>
                        </button>
                        <button className="btn btn--style-secondary btn--size-small btn--icon" onClick={() => handleDeleteGroqKey(key.id)} style={{ color: "#ef4444", padding: "4px 10px" }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px dashed var(--theme-elevation-200)", paddingTop: "20px" }}>
              <div style={{ fontWeight: 600, marginBottom: "12px", color: "var(--theme-text)" }}>Thêm Groq Key mới</div>
              {groqKeyMsg && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "1.1rem", background: groqKeyMsg.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", border: `1px solid ${groqKeyMsg.type === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`, color: groqKeyMsg.type === "success" ? "#22c55e" : "#ef4444" }}>
                  {groqKeyMsg.text}
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 30%" }}>
                  <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="VD: Groq Key 1..." value={newGroqLabel} onChange={(e) => setNewGroqLabel(e.target.value)} />
                </div>
                <div style={{ flex: "1 1 70%", position: "relative" }}>
                  <input type={showNewGroqKey ? "text" : "password"} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="gsk_..." value={newGroqKey} onChange={(e) => setNewGroqKey(e.target.value)} style={{ paddingRight: "44px", fontFamily: "monospace" }} />
                  <button type="button" onClick={() => setShowNewGroqKey(!showNewGroqKey)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)" }}>{showNewGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                <button type="button" className="btn btn--style-primary" onClick={handleAddGroqKey} disabled={addingGroqKey} style={{ height: "46px", margin: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {addingGroqKey ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Đang thêm...</> : <><Plus className="w-4 h-4" /> Thêm Key</>}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
