"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X, Save } from "lucide-react";

export default function AiKnowledgeTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    sourceUrl: "",
    sourceExt: "",
    allowedDepartment: ""
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type: string, text: string} | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-knowledge?limit=100");
      const json = await res.json();
      if (json.docs) setItems(json.docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ title: "", category: "", content: "", sourceUrl: "", sourceExt: "", allowedDepartment: "" });
    setView("form");
    setMsg(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      category: item.category || "",
      content: item.content || "",
      sourceUrl: item.sourceUrl || "",
      sourceExt: item.sourceExt || "",
      allowedDepartment: item.allowedDepartment || ""
    });
    setView("form");
    setMsg(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa tài liệu này không?")) return;
    try {
      const res = await fetch(`/api/ai-knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems();
      } else {
        alert("Lỗi khi xóa tài liệu.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.content) {
      setMsg({ type: "error", text: "Vui lòng nhập Tiêu đề, Nhãn chuyên môn và Nội dung." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const url = editingId ? `/api/ai-knowledge/${editingId}` : "/api/ai-knowledge";
      const method = editingId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (res.ok) {
        setMsg({ type: "success", text: "Lưu tài liệu thành công!" });
        setTimeout(() => {
          setView("list");
          fetchItems();
        }, 1000);
      } else {
        setMsg({ type: "error", text: json.errors?.[0]?.message || "Lưu thất bại" });
      }
    } catch (e) {
      setMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setSaving(false);
    }
  };

  if (view === "form") {
    return (
      <div style={{ maxWidth: "800px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--theme-text)" }}>{editingId ? "Sửa tài liệu AI" : "Thêm tài liệu mới"}</div>
          <button className="btn btn--style-secondary btn--size-small" onClick={() => setView("list")} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <X className="w-4 h-4" /> Đóng
          </button>
        </div>

        {msg && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600, background: msg.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", border: `1px solid ${msg.type === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`, color: msg.type === "success" ? "#22c55e" : "#ef4444" }}>
            {msg.text}
          </div>
        )}

        <div style={{ background: "var(--theme-elevation-50)", padding: "24px", borderRadius: "12px", border: "1px solid var(--theme-elevation-150)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "var(--theme-text)" }}>Tên tài liệu *</label>
            <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Hướng dẫn phòng chống SXH" />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "var(--theme-text)" }}>Nhãn chuyên môn *</label>
            <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="VD: Sốt xuất huyết" />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "var(--theme-text)" }}>Nội dung văn bản *</label>
            <textarea className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Nội dung kiến thức để AI học..." />
          </div>
          
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "var(--theme-text)" }}>Link gốc (Tuỳ chọn)</label>
              <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl outline-none focus:border-blue-500" value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} placeholder="https://docs.google.com/..." />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "var(--theme-text)" }}>Đuôi file (Tuỳ chọn)</label>
              <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl outline-none focus:border-blue-500" value={formData.sourceExt} onChange={e => setFormData({...formData, sourceExt: e.target.value})} placeholder="VD: .pdf" />
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "var(--theme-text)" }}>Phòng ban được phép xem</label>
            <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl outline-none focus:border-blue-500" value={formData.allowedDepartment} onChange={e => setFormData({...formData, allowedDepartment: e.target.value})} placeholder="Để trống cho tất cả" />
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn--style-primary" onClick={handleSave} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save className="w-4 h-4" />} {saving ? "Đang lưu..." : "Lưu tài liệu"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--theme-text)" }}>Kho tri thức AI</div>
        <button className="btn btn--style-primary" onClick={handleCreateNew} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus className="w-4 h-4" /> Thêm tài liệu
        </button>
      </div>

      <div style={{ background: "var(--theme-elevation-50)", padding: "20px", borderRadius: "12px", border: "1px solid var(--theme-elevation-150)" }}>
        {loading ? (
          <div style={{ color: "var(--theme-text)", padding: "16px 0", textAlign: "center" }}>Đang tải dữ liệu...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--theme-text)", border: "1px dashed var(--theme-elevation-200)", borderRadius: "8px" }}>
            Chưa có tài liệu nào trong Kho tri thức AI.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--theme-elevation-150)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--theme-text)", fontWeight: 600 }}>Tên tài liệu</th>
                  <th style={{ padding: "12px 16px", color: "var(--theme-text)", fontWeight: 600 }}>Nhãn chuyên môn</th>
                  <th style={{ padding: "12px 16px", color: "var(--theme-text)", fontWeight: 600, textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--theme-elevation-150)" }}>
                    <td style={{ padding: "16px", color: "var(--theme-text)", fontWeight: 500 }}>{item.title}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ padding: "4px 10px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button className="btn btn--style-secondary btn--size-small btn--icon" onClick={() => handleEdit(item)} title="Sửa"><Edit className="w-4 h-4" /></button>
                      <button className="btn btn--style-secondary btn--size-small btn--icon" onClick={() => handleDelete(item.id)} title="Xoá" style={{ color: "#ef4444" }}><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
