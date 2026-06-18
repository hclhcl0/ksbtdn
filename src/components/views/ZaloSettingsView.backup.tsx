"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Trash2, Eye, EyeOff, AlertCircle, Copy, Link, Bot, Mail, Building2, Search, RefreshCw } from "lucide-react";

// Các nhóm cài đặt
const SETTING_GROUPS = [
  {
    id: "zalo_integration",
    icon: <Link className="w-5 h-5" />,
    title: "Kết nối Zalo OA",
    desc: "Thiết lập API, Webhook và OAuth cho Zalo OA.",
    fields: [
      { key: "zalo_app_id",        label: "App ID",          type: "text",     placeholder: "VD: 123456789",              secret: false },
      { key: "zalo_app_secret",    label: "App Secret",      type: "password", placeholder: "••••••••••••••••",           secret: true  },
      { key: "zalo_oa_id",         label: "OA ID",           type: "text",     placeholder: "VD: 1234567890123456789",    secret: false },
      { key: "zalo_access_token",  label: "Access Token",    type: "password", placeholder: "••••••••••••••••",           secret: true  },
      { key: "zalo_refresh_token", label: "Refresh Token",   type: "password", placeholder: "••••••••••••••••",           secret: true  },
      { key: "webhook_verify_token", label: "Verify Token (tự đặt)", type: "text", placeholder: "VD: cdc_danang_secret_2026", secret: false },
    ],
    readonly: [
      { label: "URL Webhook (đã deploy)", value: "{SITE_URL}/api/zalo/webhook", note: "Thay {SITE_URL} bằng domain thực tế của bạn." },
    ],
  },
  {
    id: "ai_data",
    icon: <Bot className="w-5 h-5" />,
    title: "AI & Kho dữ liệu",
    desc: "Cấu hình trí tuệ nhân tạo và kết nối nguồn tài liệu mẫu.",
    fields: [
      { key: "ai_menu_categories", label: "Tùy chỉnh Danh mục (Menu Công Dân)", type: "textarea", placeholder: "Ví dụ:\n1. Tiêm chủng\n2. Sốt xuất huyết\n(Nếu để trống sẽ tự lấy từ kho tài liệu)" },
      { key: "ai_menu_categories_staff", label: "Tùy chỉnh Danh mục (Menu Nhân Viên Nội Bộ)", type: "textarea", placeholder: "Ví dụ:\n1. Tra cứu Lương / Thưởng\n2. Quy định công tác\n(Nếu để trống sẽ dùng chung danh mục công dân)" },
      { key: "ai_daily_limit", label: "Giới hạn câu hỏi/ngày (1 Zalo)", type: "number", placeholder: "Để trống hoặc 0 là không giới hạn" },
      { key: "ai_custom_prompt", label: "Tùy chỉnh Prompt cho AI (Nâng cao)", type: "textarea", placeholder: "Ví dụ: Luôn xưng hô là 'Bác sĩ CDC' và gọi người dùng là 'Bạn'..." },
      { key: "ai_footer_msg", label: "Câu kết thúc dưới mỗi tin trả lời của AI", type: "text", placeholder: "VD: (Địa chỉ: 118 Lê Đình Lý - Hotline: 1900988975) - Để trống để tắt" },
      { key: "drive_folder_id", label: "ID Thư mục Google Drive", type: "text", placeholder: "VD: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs (lấy từ URL folder)" },
      { key: "google_api_key",  label: "Google API Key — dùng khi folder Công khai (Anyone with link)", type: "password", secret: true, placeholder: "••••••••••••••••" },
    ],
  },
  {
    id: "messaging_tools",
    icon: <Mail className="w-5 h-5" />,
    title: "Tiện ích gửi tin",
    desc: "Cấu hình mẫu tin ZNS, tự động hóa và hòm thư Gmail.",
    fields: [
      { key: "zns_template_appointment", label: "Template: Xác nhận lịch hẹn",     type: "text", placeholder: "VD: 123456" },
      { key: "zns_template_reminder",    label: "Template: Nhắc lịch trước 1 ngày", type: "text", placeholder: "VD: 123457" },
      { key: "zns_template_result",      label: "Template: Thông báo có kết quả",   type: "text", placeholder: "VD: 123458" },
      { key: "zalo_cron_enabled", label: "Bật gửi tin tự động", type: "checkbox" },
      { key: "zalo_cron_time",    label: "Giờ tự động gửi", type: "time", placeholder: "08:00" },
    ],
  },
  {
    id: "oa_display",
    icon: <Building2 className="w-5 h-5" />,
    title: "Thông tin OA",
    desc: "Thông tin liên hệ và hiển thị trên Zalo Mini App.",
    fields: [
      { key: "hotline_main",   label: "Hotline chính",          type: "tel",  placeholder: "VD: 1900988975" },
      { key: "hotline_zns",    label: "Hotline hỗ trợ Zalo",    type: "tel",  placeholder: "VD: 0905.123.456"   },
      { key: "address",        label: "Địa chỉ trụ sở CDC",     type: "text", placeholder: "VD: 118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng" },
      { key: "map_embed_url",  label: "Link Google Maps (Embed)", type: "text", placeholder: "https://www.google.com/maps/embed?..." },
      { key: "working_hours",  label: "Giờ làm việc",           type: "text", placeholder: "VD: 07:30 - 16:30" },
      { key: "oa_display_name", label: "Tên hiển thị OA",   type: "text",     placeholder: "VD: CDC Đà Nẵng" },
      { key: "oa_welcome_msg",  label: "Tin chào người theo dõi mới", type: "textarea", placeholder: "VD: Xin chào! Cảm ơn bạn đã quan tâm..." },
      { key: "chatbot_default_reply", label: "Tin nhắn mặc định (không khớp từ khóa)", type: "textarea", placeholder: "VD: Xin chào! Bạn có thể hỏi về đặt lịch..." },
    ],
  },
];

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [values, setValues]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [activeTab, setActiveTab] = useState("oauth");
  const [oauthData, setOauthData] = useState(null); // { authUrl, redirectUri, codeChallenge, state }
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthMsg, setOauthMsg] = useState(null); // thông báo sau callback


  // Gmail Pool states
  const [accounts, setAccounts] = useState([]);
  const [batchSize, setBatchSize] = useState(10);
  const [delayMs, setDelayMs] = useState(2000);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [addMode, setAddMode] = useState("apppass"); // "apppass" | "oauth2"
  const [gmailOAuthLoading, setGmailOAuthLoading] = useState(false);
  const [gmailOAuthMsg, setGmailOAuthMsg] = useState(null);

  // Gemini API Keys Pool states
  const [geminiKeys, setGeminiKeys] = useState([]);
  const [geminiKeysLoading, setGeminiKeysLoading] = useState(false);
  const [newGeminiLabel, setNewGeminiLabel] = useState("");
  const [newGeminiKey, setNewGeminiKey] = useState("");
  const [showNewGeminiKey, setShowNewGeminiKey] = useState(false);
  const [geminiKeyMsg, setGeminiKeyMsg] = useState(null);
  const [addingGeminiKey, setAddingGeminiKey] = useState(false);

  const fetchGeminiKeys = async () => {
    setGeminiKeysLoading(true);
    try {
      const res = await fetch("/api/zalo-admin/settings/gemini-keys");
      const json = await res.json();
      if (json.success) setGeminiKeys(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGeminiKeysLoading(false);
    }
  };

  const handleAddGeminiKey = async () => {
    if (!newGeminiLabel.trim() || !newGeminiKey.trim()) {
      setGeminiKeyMsg({ type: "error", text: "Vui lòng nhập cả tên gợi nhớ và API Key." });
      return;
    }
    setAddingGeminiKey(true);
    setGeminiKeyMsg(null);
    try {
      const res = await fetch("/api/zalo-admin/settings/gemini-keys", {
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

  const handleToggleGeminiKey = async (id, isActive) => {
    try {
      await fetch("/api/zalo-admin/settings/gemini-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchGeminiKeys();
    } catch (e) { console.error(e); }
  };

  const handleDeleteGeminiKey = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa API Key này không?")) return;
    const res = await fetch(`/api/zalo-admin/settings/gemini-keys?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchGeminiKeys();
    } else {
      alert("Lỗi: " + json.error);
    }
  };

  // Groq API Keys Pool states
  const [groqKeys, setGroqKeys] = useState([]);
  const [groqKeysLoading, setGroqKeysLoading] = useState(false);
  const [newGroqLabel, setNewGroqLabel] = useState("");
  const [newGroqKey, setNewGroqKey] = useState("");
  const [showNewGroqKey, setShowNewGroqKey] = useState(false);
  const [groqKeyMsg, setGroqKeyMsg] = useState(null);
  const [addingGroqKey, setAddingGroqKey] = useState(false);

  // Google Drive OAuth states
  const [driveOAuthLoading, setDriveOAuthLoading] = useState(false);
  const [driveOAuthMsg, setDriveOAuthMsg] = useState(null);
  const [driveConnected, setDriveConnected] = useState(false);

  const fetchGroqKeys = async () => {
    setGroqKeysLoading(true);
    try {
      const res = await fetch("/api/zalo-admin/settings/groq-keys");
      const json = await res.json();
      if (json.success) setGroqKeys(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGroqKeysLoading(false);
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
      const res = await fetch("/api/zalo-admin/settings/groq-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newGroqLabel, apiKey: newGroqKey }),
      });
      const json = await res.json();
      if (json.success) {
        setGroqKeyMsg({ type: "success", text: "Đã thêm API Key thành công!" });
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

  const handleToggleGroqKey = async (id, isActive) => {
    try {
      await fetch("/api/zalo-admin/settings/groq-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchGroqKeys();
    } catch (e) { console.error(e); }
  };

  const handleDeleteGroqKey = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa API Key này không?")) return;
    const res = await fetch(`/api/zalo-admin/settings/groq-keys?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchGroqKeys();
    } else {
      alert("Lỗi: " + json.error);
    }
  };

  // Load Gmail configuration from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAcc = localStorage.getItem("cdc_gmail_pool");
      if (savedAcc) {
        try {
          setAccounts(JSON.parse(savedAcc));
        } catch (e) {
          console.error(e);
        }
      }
      const savedBatch = localStorage.getItem("cdc_email_batch_size");
      if (savedBatch) setBatchSize(Number(savedBatch));
      const savedDelay = localStorage.getItem("cdc_email_delay_ms");
      if (savedDelay) setDelayMs(Number(savedDelay));
      setIsLocalLoaded(true);
    }
  }, []);

  // Load AI Keys khi chuyển sang tab ai_config
  useEffect(() => {
    if (activeTab === "ai_config") {
      fetchGeminiKeys();
      fetchGroqKeys();
    }
  }, [activeTab]);

  // Save Gmail pool to localStorage on change
  useEffect(() => {
    if (isLocalLoaded && typeof window !== "undefined") {
      localStorage.setItem("cdc_gmail_pool", JSON.stringify(accounts));
    }
  }, [accounts, isLocalLoaded]);

  // Save Gmail batchSize to localStorage on change
  useEffect(() => {
    if (isLocalLoaded && typeof window !== "undefined") {
      localStorage.setItem("cdc_email_batch_size", String(batchSize));
    }
  }, [batchSize, isLocalLoaded]);

  // Save Gmail delayMs to localStorage on change
  useEffect(() => {
    if (isLocalLoaded && typeof window !== "undefined") {
      localStorage.setItem("cdc_email_delay_ms", String(delayMs));
    }
  }, [delayMs, isLocalLoaded]);

  const addAccount = () => {
    if (!newEmail.trim() || !newPass.trim()) return;
    setAccounts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        user: newEmail.trim(),
        appPassword: newPass.replace(/\s/g, ""),
        showPass: false,
      },
    ]);
    setNewEmail("");
    setNewPass("");
  };

  const removeAccount = (id) => setAccounts((prev) => prev.filter((a) => a.id !== id));
  const togglePass = (id) =>
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, showPass: !a.showPass } : a))
    );

  // Bắt đầu luồng Gmail OAuth2
  const handleGmailOAuth = async () => {
    setGmailOAuthLoading(true);
    setGmailOAuthMsg(null);
    try {
      const emailHint = newEmail.trim();
      const res = await fetch(`/api/zalo-admin/auth/gmail-oauth${emailHint ? `?email=${encodeURIComponent(emailHint)}` : ""}`);
      const data = await res.json();
      if (data.error) {
        setGmailOAuthMsg({ type: "error", text: data.error });
      } else {
        // Mở tab Google để xác nhận
        window.open(data.authUrl, "_self");
      }
    } catch (e) {
      setGmailOAuthMsg({ type: "error", text: "Không kết nối được server." });
    } finally {
      setGmailOAuthLoading(false);
    }
  };



  // Tải cài đặt từ database
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/zalo-admin/settings");
      const json = await res.json();
      const flat = {};
      Object.entries(json.data ?? {}).forEach(([k, v]) => {
        flat[k] = v.value;
      });
      setValues(flat);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Đọc kết quả Zalo OAuth callback từ query params
  useEffect(() => {
    const success = searchParams.get("oauth_success");
    const err     = searchParams.get("oauth_error");
    if (success) {
      setOauthMsg({ type: "success", text: "✅ Xác thực thành công! Access Token đã được lưu vào hệ thống." });
      setActiveTab("oauth");
      loadSettings();
      router.replace("/settings");
    }
    if (err) {
      setOauthMsg({ type: "error", text: `❌ Lỗi OAuth: ${decodeURIComponent(err)}` });
      setActiveTab("oauth");
      router.replace("/settings");
    }
  }, [searchParams, loadSettings, router]);

  // Đọc kết quả Gmail OAuth2 callback từ query params
  useEffect(() => {
    const gmailSuccess = searchParams.get("gmail_oauth_success");
    const gmailError   = searchParams.get("gmail_oauth_error");
    const gmailToken   = searchParams.get("gmail_token");

    if (gmailSuccess && gmailToken) {
      try {
        const tokenData = JSON.parse(decodeURIComponent(gmailToken));
        const { email, refreshToken, accessToken } = tokenData;
        if (email && refreshToken) {
          setAccounts((prev) => {
            // Nếu đã có account này → cập nhật token
            const exists = prev.find((a) => a.user === email);
            if (exists) {
              return prev.map((a) =>
                a.user === email
                  ? { ...a, refreshToken, accessToken: accessToken || a.accessToken }
                  : a
              );
            }
            // Chưa có → thêm mới
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                user: email,
                refreshToken,
                accessToken: accessToken || "",
                authType: "oauth2",
              },
            ];
          });
          setGmailOAuthMsg({ type: "success", text: `✅ Đã kết nối Gmail OAuth2: ${email}` });
          setActiveTab("gmail_pool");
        }
      } catch (e) {
        console.error(e);
      }
      router.replace("/settings?tab=gmail_pool");
    }

    if (gmailError) {
      setGmailOAuthMsg({ type: "error", text: `❌ ${decodeURIComponent(gmailError)}` });
      setActiveTab("gmail_pool");
      router.replace("/settings?tab=gmail_pool");
    }
  }, [searchParams, router]);

  // Đọc kết quả Drive OAuth callback từ query params
  useEffect(() => {
    const driveSuccess = searchParams.get("drive_oauth_success");
    const driveError = searchParams.get("drive_oauth_error");

    if (driveSuccess) {
      setDriveOAuthMsg({ type: "success", text: "✅ Đã kết nối thư mục Google Drive qua OAuth2 thành công!" });
      setActiveTab("drive_docs");
      loadSettings();
      router.replace("/settings?tab=drive_docs");
    }

    if (driveError) {
      setDriveOAuthMsg({ type: "error", text: `❌ Lỗi: ${decodeURIComponent(driveError)}` });
      setActiveTab("drive_docs");
      router.replace("/settings?tab=drive_docs");
    }
  }, [searchParams, loadSettings, router]);

  // Đọc tab hoạt động từ query params (ví dụ: ?tab=gmail_pool)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && SETTING_GROUPS.some(g => g.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Tạo URL OAuth để redirect Admin sang Zalo
  async function handleGenerateOAuthUrl() {
    setOauthLoading(true);
    setOauthMsg(null);
    setOauthData(null);
    try {
      const res = await fetch("/api/zalo-admin/zalo/oauth");
      const data = await res.json();
      if (data.error) {
        setOauthMsg({ type: "error", text: `❌ ${data.error}` });
      } else {
        setOauthData(data);
      }
    } catch {
      setOauthMsg({ type: "error", text: "❌ Không thể kết nối server." });
    } finally {
      setOauthLoading(false);
    }
  }

  // Lưu tất cả cài đặt
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const payload = Object.entries(values).map(([key, value]) => ({
      key,
      value,
      label: key,
    }));
    await fetch("/api/zalo-admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Làm mới Access Token tự động
  async function handleRefreshToken() {
    setRefreshing(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/zalo-admin/settings/refresh-token", { method: "POST" });
      const data = await res.json();
      setTestResult(data);
      if (data.success) loadSettings(); // Tải lại token mới
    } catch {
      setTestResult({ success: false, message: "Không thể kết nối đến server." });
    } finally {
      setRefreshing(false);
    }
  }

  // Kiểm tra kết nối Zalo
  async function handleTestZalo() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/zalo-admin/settings/test-zalo");
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: "Không thể kết nối đến server." });
    } finally {
      setTesting(false);
    }
  }

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div style={{ textAlign: "center", color: "var(--theme-text)" }}>
          <div className="spinner" style={{ borderColor: "var(--theme-elevation-150)", borderTopColor: "#3b82f6", width: 32, height: 32, margin: "0 auto 12px" }} />
          Đang tải cài đặt...
        </div>
      </div>
    );
  }

  const activeGroup = SETTING_GROUPS.find((g) => g.id === activeTab);

  const formatTokens = (val) => {
    if (!val) return "0";
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toString();
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .settings-horizontal-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .settings-vertical-menu {
            display: none !important;
          }
          .settings-horizontal-menu {
            display: flex !important;
            overflow-x: auto;
            gap: 6px;
            padding: 6px 8px;
            margin-bottom: 16px;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            box-sizing: border-box;
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .settings-horizontal-menu::-webkit-scrollbar {
            display: none;
          }
          .settings-horizontal-tab-pill {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 8px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 500;
            color: #64748b;
            white-space: nowrap;
            transition: all 0.15s;
          }
          .settings-horizontal-tab-pill.active {
            background: #eff6ff;
            color: #3b82f6;
            font-weight: 600;
          }
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />

      {/* Header with Tabs */}
      <div className="mb-8" style={{ marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "flex-start", alignItems: "center" }}>
        
        {/* Horizontal Tab menu */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
          {SETTING_GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px",
                background: activeTab === group.id ? "#3b82f6" : "var(--theme-elevation-50)",
                color: activeTab === group.id ? "white" : "var(--theme-text)",
                border: "1px solid",
                borderColor: activeTab === group.id ? "#3b82f6" : "var(--theme-elevation-150)",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: activeTab === group.id ? 600 : 500,
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                boxShadow: activeTab === group.id ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <span>{group.icon}</span>
              {group.title}
            </button>
          ))}
          <a
            href="/admin/collections/ai-knowledge"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px",
              background: "var(--theme-elevation-50)",
              color: "var(--theme-text)",
              border: "1px solid",
              borderColor: "var(--theme-elevation-150)",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              boxShadow: "none",
              textDecoration: "none",
            }}
          >
            <span>📂</span> Kho tri thức AI
          </a>
          <a
            href="/admin/collections/api-keys"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px",
              background: "var(--theme-elevation-50)",
              color: "var(--theme-text)",
              border: "1px solid",
              borderColor: "var(--theme-elevation-150)",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              boxShadow: "none",
              textDecoration: "none",
            }}
          >
            <span>🔑</span> Danh sách API Keys
          </a>
        </div>
      </div>

      <div>

        {/* Nội dung tab */}
        {activeGroup && (
          <div style={{ maxWidth: "800px" }}>
            {/* Custom UI blocks container */}
            <div style={{ marginBottom: "32px", display: (activeGroup.id === "zalo_integration" || activeGroup.id === "messaging_tools" || activeGroup.id === "ai_data") ? "block" : "none" }}>

              {/* UI cho tab OAuth */}
              {activeGroup.id === "zalo_integration" && (
                <div style={{ marginBottom: "20px" }}>
                  {oauthMsg && (
                    <div style={{
                      padding: "12px 16px", borderRadius: "12px", marginBottom: "16px",
                      background: oauthMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${oauthMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                      color: oauthMsg.type === "success" ? "#15803d" : "#dc2626",
                      fontWeight: 600, fontSize: "1.1rem",
                    }}>
                      {oauthMsg.text}
                    </div>
                  )}
                  <div className="form-group" style={{ marginBottom: "24px" }}>
                    <label className="block font-semibold text-base mb-2 " style={{ marginBottom: "8px", display: "block" }}>📎 Callback URL — dán vào Zalo Developers</label>
                    <div style={{ position: "relative" }}>
                      <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" value={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/zalo/callback`} readOnly style={{ width: "100%", paddingRight: "40px", background: "var(--theme-elevation-50)", fontFamily: "monospace", color: "var(--theme-text)", margin: 0 }} />
                      <button type="button" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/zalo/callback`)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} title="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button className="btn btn--style-primary btn--size-small" onClick={handleGenerateOAuthUrl} disabled={oauthLoading} style={{ marginTop: "4px" }}>
                    {oauthLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Đang tạo...</> : "➕ Tạo URL Authorization & Code Challenge"}
                  </button>
                  {oauthData && (
                    <div style={{ marginTop: "20px", padding: "16px", background: "var(--theme-elevation-50)", borderRadius: "12px", border: "1px solid var(--theme-elevation-150)" }}>
                      <div style={{ marginBottom: "16px" }}>
                        <label className="block font-semibold text-base mb-2 " style={{ marginBottom: "8px", display: "block" }}>🔗 Authorization URL</label>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <div style={{ position: "relative", flex: 1 }}>
                            <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" value={oauthData.authUrl} readOnly style={{ width: "100%", paddingRight: "40px", fontFamily: "monospace", color: "var(--theme-text)", margin: 0 }} />
                            <button type="button" onClick={() => navigator.clipboard.writeText(oauthData.authUrl)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} title="Copy">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <a href={oauthData.authUrl} target="_blank" rel="noopener noreferrer" className="btn btn--style-primary btn--size-small" style={{ textDecoration: "none", display: "inline-flex", whiteSpace: "nowrap" }}>
                            🔑 Bắt đầu xác thực với Zalo
                          </a>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                           <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.85rem" }}>Code Challenge (tự động)</label>
                           <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" value={oauthData.codeChallenge} readOnly style={{ fontFamily: "monospace", color: "var(--theme-text)" }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                           <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.85rem" }}>State (chống CSRF)</label>
                           <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" value={oauthData.state} readOnly style={{ fontFamily: "monospace", color: "var(--theme-text)" }} />
                        </div>
                      </div>
                      <a href={oauthData.authUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm active:scale-95 transition-all" style={{ textDecoration: "none", display: "inline-flex" }}>
                        🚀 Mở trang Zalo xác nhận cấp quyền ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* UI cho tab Gmail Account Pool */}
              {activeGroup.id === "messaging_tools" && (
                <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>

                  {/* Thông báo OAuth2 */}
                  {gmailOAuthMsg && (
                    <div style={{
                      padding: "12px 16px", borderRadius: "12px", marginBottom: "16px",
                      background: gmailOAuthMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${gmailOAuthMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                      color: gmailOAuthMsg.type === "success" ? "#15803d" : "#dc2626",
                      fontWeight: 600, fontSize: "1.1rem",
                      display: "flex", alignItems: "center", gap: "10px"
                    }}>
                      {gmailOAuthMsg.text}
                      <button onClick={() => setGmailOAuthMsg(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* Cột trái: Danh sách & form thêm */}
                    <div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>📧 Danh sách tài khoản trong Pool</span>
                        {accounts.length > 0 && <span className="badge badge-info">{accounts.length}</span>}
                      </h3>

                      {/* Tab chọn kiểu thêm mới */}
                      <div style={{ display: "flex", gap: "6px", background: "var(--theme-elevation-50)", padding: "4px", borderRadius: "12px", border: "1px solid var(--theme-elevation-150)", marginBottom: "14px", width: "fit-content" }}>
                        {[
                          { id: "apppass", label: "🔑 App Password" },
                          { id: "oauth2",  label: "🔗 Gmail OAuth2 (khuyến nghị)" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setAddMode(m.id)}
                            style={{
                              padding: "6px 14px", fontSize: "0.875rem", fontWeight: addMode === m.id ? 700 : 500,
                              background: addMode === m.id ? "white" : "transparent",
                              border: "none", borderRadius: "6px", cursor: "pointer",
                              color: addMode === m.id ? "#3b82f6" : "var(--theme-text)",
                              boxShadow: addMode === m.id ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)" : "none",
                              transition: "all 0.15s"
                            }}
                          >{m.label}</button>
                        ))}
                      </div>

                      {/* Form App Password */}
                      {addMode === "apppass" && (
                        <div style={{ background: "var(--theme-elevation-50)", border: "1px solid var(--theme-elevation-150)", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ fontSize: "0.875rem", color: "#78350f", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px", lineHeight: 1.6 }}>
                            ⚠️ App Password có thể gặp lỗi <strong>454 Too many login attempts</strong>. Khuyến nghị dùng <strong>OAuth2</strong>.
                          </div>
                          <input type="email" placeholder="Email gửi (vd: cdc@gmail.com)" value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" style={{ height: "36px" }} />
                          <input type="password" placeholder="Mật khẩu ứng dụng (16 ký tự không dấu cách)" value={newPass}
                            onChange={(e) => setNewPass(e.target.value)} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" style={{ height: "36px" }} />
                          <button onClick={addAccount} disabled={!newEmail.trim() || !newPass.trim()}
                            className="btn btn--style-primary btn--size-small" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Plus className="w-4 h-4" /> Thêm vào Pool
                          </button>
                        </div>
                      )}

                      {/* Form OAuth2 */}
                      {addMode === "oauth2" && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ fontSize: "0.9rem", color: "#14532d", lineHeight: 1.6 }}>
                            ✅ <strong>OAuth2</strong> — Không cần App Password, không bị lỗi 454. Google cấp quyền trực tiếp.
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "var(--theme-text)", background: "white", borderRadius: "6px", padding: "10px 12px", border: "1px solid var(--theme-elevation-150)", lineHeight: 1.7 }}>
                            <strong>Yêu cầu trước:</strong> Điền <strong>Client ID</strong> và <strong>Client Secret</strong> vào ô bên phải rồi bấm Lưu cài đặt.<br/>
                            Sau đó nhập email Gmail muốn kết nối và bấm nút bên dưới.
                          </div>
                          <input type="email" placeholder="Gmail muốn kết nối (vd: hclhcl0@gmail.com)" value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" style={{ height: "36px" }} />
                          <button
                            onClick={handleGmailOAuth}
                            disabled={gmailOAuthLoading || !newEmail.trim()}
                            className="btn btn--style-primary btn--size-medium"
                            style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "8px" }}
                          >
                            {gmailOAuthLoading
                              ? <><span className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.4)", borderTopColor: "white" }} /> Đang mở Google...</>
                              : "🔗 Kết nối Gmail qua OAuth2"}
                          </button>
                        </div>
                      )}

                      {/* Accounts list */}
                      {accounts.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--theme-text)", fontSize: "0.9rem", border: "2px dashed #e2e8f0", borderRadius: "12px" }}>
                          Chưa có tài khoản Gmail nào được cấu hình.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                          {accounts.map((acc, idx) => {
                            const isOAuth2 = Boolean(acc.refreshToken);
                            return (
                              <div key={acc.id} style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: isOAuth2 ? "#f0fdf4" : "white",
                                border: `1px solid ${isOAuth2 ? "#bbf7d0" : "var(--theme-elevation-150)"}`,
                                borderRadius: "12px", padding: "8px 12px"
                              }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: isOAuth2 ? "#22c55e" : "var(--theme-elevation-150)", color: "white", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  {idx + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0, fontSize: "0.9rem" }}>
                                  <p style={{ fontWeight: 600, color: "var(--theme-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{acc.user}</p>
                                  <p style={{ margin: 0, fontSize: "0.72rem" }}>
                                    {isOAuth2
                                      ? <span style={{ color: "#15803d", fontWeight: 600 }}>🔗 OAuth2 — Đã kết nối</span>
                                      : <span style={{ color: "var(--theme-text)", fontFamily: "monospace" }}>{acc.showPass ? acc.appPassword : "•••• •••• •••• ••••"}</span>
                                    }
                                  </p>
                                </div>
                                {!isOAuth2 && (
                                  <button className="btn btn--style-secondary btn--size-small" style={{ padding: "4px", minWidth: "auto", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => togglePass(acc.id)}>
                                    {acc.showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                                <button className="btn btn--style-secondary btn--size-small" style={{ padding: "4px", minWidth: "auto", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => removeAccount(acc.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Cột phải: OAuth2 credentials + Tốc độ gửi */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* Google OAuth2 Credentials */}
                      <div style={{ marginBottom: "24px" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                          🔑 Google OAuth2 Credentials
                        </h4>
                        <div style={{ fontSize: "0.85rem", color: "var(--theme-text)", marginBottom: "16px", lineHeight: 1.6 }}>
                          Tạo tại <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>Google Cloud Console</a> → OAuth 2.0 Client ID → Web application.
                        </div>
                        <div className="form-group" style={{ marginBottom: "16px" }}>
                          <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Client ID</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                            placeholder="xxxx.apps.googleusercontent.com"
                            value={values.gmail_oauth_client_id || ""}
                            onChange={(e) => handleChange("gmail_oauth_client_id", e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Client Secret</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                            placeholder="GOCSPX-••••••••••••"
                            value={values.gmail_oauth_client_secret || ""}
                            onChange={(e) => handleChange("gmail_oauth_client_secret", e.target.value)}
                          />
                        </div>
                        <div style={{ marginTop: "10px", fontSize: "0.72rem", color: "var(--theme-text)", lineHeight: 1.6, padding: "8px", background: "white", borderRadius: "6px", border: "1px dashed #e2e8f0" }}>
                          <strong>Redirect URI</strong> cần thêm vào Google Cloud:<br/>
                          <code style={{ fontSize: "0.7rem", wordBreak: "break-all", color: "#3b82f6" }}>
                            {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/auth/gmail-callback
                          </code>
                        </div>
                      </div>

                      {/* Tuỳ chọn Gửi Email */}
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>⚙️ Tùy chọn Gửi Email</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Tên người gửi (Sender Name)</label>
                            <input 
                              type="text" 
                              value={values.email_sender_name ?? "CDC Đà Nẵng"} 
                              onChange={(e) => handleChange("email_sender_name", e.target.value)} 
                              className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                              placeholder="VD: CDC Đà Nẵng"
                            />
                            <span style={{ fontSize: "0.7rem", color: "var(--theme-text)", display: "block", marginTop: "4px" }}>Tên hiển thị khi người dân/nhân viên nhận được email.</span>
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Số email mỗi đợt</label>
                            <input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
                            <span style={{ fontSize: "0.7rem", color: "var(--theme-text)", display: "block", marginTop: "4px" }}>Gửi tuần tự từng đợt để ổn định.</span>
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Giãn cách giữa đợt (ms)</label>
                            <input type="number" value={delayMs} onChange={(e) => setDelayMs(Number(e.target.value))} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
                            <span style={{ fontSize: "0.7rem", color: "var(--theme-text)", display: "block", marginTop: "4px" }}>VD: 2000 = 2 giây.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}




              {/* UI cho tab Gemini AI Keys */}
              {activeGroup.id === "ai_data" && (
  <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1.1rem" }}>⚙️ Chọn Nhà Cung Cấp AI Chính</div>
      <div style={{ display: "flex", gap: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input type="radio" name="aiProvider" value="gemini" checked={values.ai_provider === "gemini" || !values.ai_provider} onChange={() => { handleChange("ai_provider", "gemini"); }} />
          <span>Google Gemini</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input type="radio" name="aiProvider" value="groq" checked={values.ai_provider === "groq"} onChange={() => { handleChange("ai_provider", "groq"); }} />
          <span>Groq (Llama-3)</span>
        </label>
      </div>
    </div>

    {(!values.ai_provider || values.ai_provider === "gemini") && (
      <div>

                <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>

                  {/* Thông báo */}
                  {geminiKeyMsg && (
                    <div style={{
                      padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "1.1rem",
                      background: geminiKeyMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${geminiKeyMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                      color: geminiKeyMsg.type === "success" ? "#15803d" : "#dc2626",
                    }}>
                      {geminiKeyMsg.type === "success" ? "✅" : "❌"} {geminiKeyMsg.text}
                    </div>
                  )}

                  {/* Danh sách key hiện tại */}
                  <div style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1.1rem" }}>🔑 Danh sách API Keys ({geminiKeys.length} key)</div>
                  {geminiKeysLoading ? (
                    <div style={{ color: "var(--theme-text)", padding: "16px 0" }}>Đang tải...</div>
                  ) : geminiKeys.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #e2e8f0", borderRadius: "8px", color: "var(--theme-text)", marginBottom: "20px" }}>
                      Chưa có API Key nào. Hệ thống sẽ dùng key mặc định từ .env
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      {geminiKeys.map((key, idx) => (
                        <div key={key.id} style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "12px 16px", background: key.isActive ? "#f0fdf4" : "#f8fafc",
                          border: `1px solid ${key.isActive ? "#bbf7d0" : "var(--theme-elevation-150)"}`,
                          borderRadius: "10px",
                        }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            background: key.isActive ? "#22c55e" : "#cbd5e1", color: "white", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0
                          }}>{idx + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--theme-text)" }}>{key.label}</div>
                            <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "2px" }}>{key.maskedKey}</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "4px" }}>
                              🔄 {key.usageCount || 0} lượt • 🪙 {formatTokens(key.usageTokens)} tokens
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                            <span style={{
                              padding: "3px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700,
                              background: key.isActive ? "#dcfce7" : "#f1f5f9",
                              color: key.isActive ? "#16a34a" : "var(--theme-text)",
                            }}>
                              {key.isActive ? "● Đang dùng" : "○ Tắt"}
                            </span>
                            <button
                              className="btn btn--style-secondary btn--size-small"
                              onClick={() => handleToggleGeminiKey(key.id, key.isActive)}
                              style={{ padding: "4px 10px" }}
                            >
                              {key.isActive ? "Tắt" : "Bật"}
                            </button>
                            <button
                              className="btn btn--style-secondary btn--size-small btn--icon"
                              onClick={() => handleDeleteGeminiKey(key.id)}
                              style={{ color: "#ef4444", padding: "4px 10px" }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form thêm key mới */}
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid var(--theme-elevation-150)" }}>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "14px" }}>➕ Thêm API Key mới</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Tên gợi nhớ</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                          placeholder="VD: Key CDC chính, Key dự phòng 1..."
                          value={newGeminiLabel}
                          onChange={(e) => setNewGeminiLabel(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>API Key (bắt đầu bằng AIza...)</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showNewGeminiKey ? "text" : "password"}
                            className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                            placeholder="AIzaSy..."
                            value={newGeminiKey}
                            onChange={(e) => setNewGeminiKey(e.target.value)}
                            style={{ paddingRight: "44px", fontFamily: "monospace" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewGeminiKey(!showNewGeminiKey)}
                            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)" }}
                          >
                            {showNewGeminiKey ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn--style-primary btn--size-medium"
                        onClick={handleAddGeminiKey}
                        disabled={addingGeminiKey}
                        style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        {addingGeminiKey && <span className="spinner" style={{ width: 12, height: 12 }} />}
                        {addingGeminiKey ? "Đang thêm..." : "➕ Thêm API Key"}
                      </button>
                    </div>
                  </div>

                  {/* Hướng dẫn */}
                  <div style={{ marginTop: "16px", padding: "12px 16px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem", color: "#1e40af", lineHeight: 1.7 }}>
                    <strong>💡 Cách hoạt động:</strong> Hệ thống sẽ tự động luân phiên (Round-Robin) qua từng API Key. Nếu một key bị rate limit (429), hệ thống tự chuyển sang key tiếp theo mà không gián đoạn dịch vụ. Key trong file <code>.env</code> vẫn là key dự phòng cuối cùng.
                    <br /><br />
                    <strong>🔗 Lấy API Key miễn phí:</strong> Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>aistudio.google.com/app/apikey</a> rồi tạo key mới (mỗi tài khoản Google cho 1 key miễn phí).
                  </div>
                </div>
              </div>
              )}

              {values.ai_provider === "groq" && (
                <div>
                  {groqKeyMsg && (
                    <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "1.1rem", background: groqKeyMsg.type === "success" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${groqKeyMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`, color: groqKeyMsg.type === "success" ? "#15803d" : "#dc2626" }}>
                      {groqKeyMsg.type === "success" ? "✅" : "❌"} {groqKeyMsg.text}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1.1rem" }}>🔑 Danh sách Groq API Keys ({groqKeys.length} key)</div>
                  {groqKeysLoading ? (
                    <div style={{ color: "var(--theme-text)", padding: "16px 0" }}>Đang tải...</div>
                  ) : groqKeys.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #e2e8f0", borderRadius: "8px", color: "var(--theme-text)", marginBottom: "20px" }}>
                      Chưa có API Key nào. Vui lòng thêm Groq API Key bên dưới.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      {groqKeys.map((key, idx) => (
                        <div key={key.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: key.isActive ? "#f0fdf4" : "#f8fafc", border: `1px solid ${key.isActive ? "#bbf7d0" : "var(--theme-elevation-150)"}`, borderRadius: "10px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: key.isActive ? "#22c55e" : "#cbd5e1", color: "white", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>{idx + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--theme-text)" }}>{key.label}</div>
                            <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "2px" }}>{key.maskedKey}</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--theme-text)", marginTop: "4px" }}>
                              🔄 {key.usageCount || 0} lượt • 🪙 {formatTokens(key.usageTokens)} tokens
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                            <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: key.isActive ? "#dcfce7" : "#f1f5f9", color: key.isActive ? "#16a34a" : "var(--theme-text)" }}>{key.isActive ? "● Đang dùng" : "○ Tắt"}</span>
                            <button className="btn btn--style-secondary btn--size-small" onClick={() => handleToggleGroqKey(key.id, key.isActive)} style={{ padding: "4px 10px" }}>{key.isActive ? "Tắt" : "Bật"}</button>
                            <button className="btn btn--style-secondary btn--size-small btn--icon" onClick={() => handleDeleteGroqKey(key.id)} style={{ color: "#ef4444", padding: "4px 10px" }}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid var(--theme-elevation-150)" }}>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "14px" }}>➕ Thêm Groq API Key mới</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>Tên gợi nhớ</label>
                        <input type="text" className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="VD: Groq Key 1..." value={newGroqLabel} onChange={(e) => setNewGroqLabel(e.target.value)} />
                      </div>
                      <div>
                        <label className="block font-semibold text-base mb-2 " style={{ fontSize: "0.875rem" }}>API Key (gsk_...)</label>
                        <div style={{ position: "relative" }}>
                          <input type={showNewGroqKey ? "text" : "password"} className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="gsk_..." value={newGroqKey} onChange={(e) => setNewGroqKey(e.target.value)} style={{ paddingRight: "44px", fontFamily: "monospace" }} />
                          <button type="button" onClick={() => setShowNewGroqKey(!showNewGroqKey)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)" }}>{showNewGroqKey ? "🙈" : "👁️"}</button>
                        </div>
                      </div>
                      <button type="button" className="btn btn--style-primary btn--size-medium" onClick={handleAddGroqKey} disabled={addingGroqKey} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}>
                        {addingGroqKey && <span className="spinner" style={{ width: 12, height: 12 }} />} {addingGroqKey ? "Đang thêm..." : "➕ Thêm API Key"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>

              {/* UI cho tab Kho tài liệu Drive */}
              {activeGroup.id === "ai_data" && (
                <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                  <div style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1.1rem" }}>🔗 Kết nối Google Drive bằng OAuth2</div>
                  <p style={{ fontSize: "0.82rem", color: "var(--theme-text)", marginBottom: "16px", lineHeight: 1.6 }}>
                    Nhấn nút bên dưới để ủy quyền cho hệ thống đọc thư mục Drive của bạn. Hệ thống dùng lại <strong>Google OAuth Client ID/Secret</strong> đã nhập ở phần cài đặt Gmail. Chỉ cần kết nối 1 lần — token sẽ được lưu tự động.
                  </p>
                  
                  {values.drive_refresh_token && (
                    <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "1.1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}>
                      ✅ Hệ thống đã được cấp quyền truy cập Google Drive thành công!
                    </div>
                  )}

                  {driveOAuthMsg && (
                    <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "1.1rem",
                      background: driveOAuthMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${driveOAuthMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                      color: driveOAuthMsg.type === "success" ? "#15803d" : "#dc2626" }}>
                      {driveOAuthMsg.type === "success" ? "✅" : "❌"} {driveOAuthMsg.text}
                    </div>
                  )}
                  <button
                    type="button"
                    className={values.drive_refresh_token ? "btn btn--style-secondary btn--size-medium" : "btn btn--style-primary btn--size-medium"}
                    disabled={driveOAuthLoading}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    onClick={async () => {
                      setDriveOAuthLoading(true);
                      setDriveOAuthMsg(null);
                      try {
                        const res = await fetch("/api/zalo-admin/auth/drive-oauth");
                        const data = await res.json();
                        if (!res.ok || !data.authUrl) {
                          setDriveOAuthMsg({ type: "error", text: data.error || "Không lấy được link xác thực." });
                        } else {
                          window.location.href = data.authUrl;
                        }
                      } catch {
                        setDriveOAuthMsg({ type: "error", text: "Không kết nối được server." });
                      } finally {
                        setDriveOAuthLoading(false);
                      }
                    }}
                  >
                    {driveOAuthLoading && <span className="spinner" style={{ width: 14, height: 14 }} />}
                    {values.drive_refresh_token ? "🔄 Kết nối lại / Đổi tài khoản Drive" : "📂 Kết nối Google Drive"}
                  </button>
                  <div style={{ marginTop: "16px", padding: "12px 16px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem", color: "#1e40af", lineHeight: 1.7 }}>
                    <strong>💡 Lưu ý:</strong> Thư mục Drive KHÔNG cần chia sẻ công khai. OAuth2 cho phép đọc file riêng tư trong Drive của bạn. Nhân viên nhận link xem — họ cần đăng nhập Google nội bộ để tải.
                  </div>
                </div>
              )}


            {(activeGroup.fields?.length > 0 || activeGroup.readonly?.length > 0 || (activeGroup.id === "oa_display" && values["map_embed_url"])) && (
              <div style={{ marginBottom: "40px" }}>
                {/* Readonly info (Webhook URL) */}
                {activeGroup.readonly?.map((item) => (
                  <div key={item.label} className="form-group" style={{ marginBottom: "24px" }}>
                    <label className="block font-semibold text-base mb-2 " style={{ marginBottom: "8px", display: "block" }}>{item.label}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        value={item.value}
                        readOnly
                        style={{ width: "100%", paddingRight: "40px", background: "var(--theme-elevation-50)", color: "var(--theme-text)", cursor: "default", fontFamily: "monospace", margin: 0 }}
                      />
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(item.value)}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {item.note && (
                      <p style={{ fontSize: "0.85rem", color: "var(--theme-text)", marginTop: "4px" }}>ℹ️ {item.note}</p>
                    )}
                  </div>
                ))}

                {/* Editable fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activeGroup.fields?.map((field, index) => {
                  if (field.type === "section") {
                    return (
                      <h4 key={`section-${index}`} style={{ margin: "24px 0 16px", paddingBottom: "8px", borderBottom: "1px solid var(--theme-elevation-150)", fontSize: "1.1rem", color: "#3b82f6" }}>
                        {field.label}
                      </h4>
                    );
                  }

                  const isVisible = showSecrets[field.key];
                  const inputType = field.secret
                    ? (isVisible ? "text" : "password")
                    : field.type === "textarea" ? undefined : field.type;

                  return (
                    <div key={field.key} className="form-group" style={{ marginBottom: "24px" }}>
                      <label className="block font-semibold text-base mb-2 " htmlFor={field.key} style={{ marginBottom: "8px", display: "block" }}>{field.label}</label>

                      {field.type === "textarea" ? (
                        <textarea
                          id={field.key}
                          className="form-textarea"
                          placeholder={field.placeholder}
                          value={values[field.key] ?? ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          rows={3}
                        />
                      ) : field.type === "checkbox" ? (
                        <div style={{ marginTop: "8px" }}>
                          <input
                            id={field.key}
                            type="checkbox"
                            checked={values[field.key] === "true"}
                            onChange={(e) => handleChange(field.key, e.target.checked ? "true" : "false")}
                            style={{ width: "20px", height: "20px", cursor: "pointer" }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ position: "relative", flex: 1 }}>
                            <input
                              id={field.key}
                              type={inputType}
                              className="w-full px-4 py-2.5 bg-[var(--theme-input-bg)] border border-[color:var(--theme-elevation-200)] text-[color:var(--theme-text)] rounded-xl text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                              placeholder={field.placeholder}
                              value={values[field.key] ?? ""}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              autoComplete={field.secret ? "off" : undefined}
                              style={{
                                width: "100%",
                                ...(field.type === "password" || field.secret ? { fontFamily: isVisible ? "Geist, Inter, sans-serif" : "monospace" } : {}),
                                ...(field.secret ? { paddingRight: "40px" } : {})
                              }}
                            />
                            {field.secret && (
                              <button
                                type="button"
                                onClick={() => setShowSecrets((p) => ({ ...p, [field.key]: !p[field.key] }))}
                                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                                title={isVisible ? "Ẩn" : "Hiện"}
                              >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                          {field.key === "zalo_oa_id" && (
                            <button
                              type="button"
                              className="btn btn--style-secondary btn--size-medium"
                              onClick={handleTestZalo}
                              disabled={testing}
                              style={{ display: "inline-flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", height: "46px", margin: 0, padding: "0 18px", borderRadius: "12px" }}
                            >
                              {testing ? (
                                <><span className="spinner" style={{ width: 14, height: 14 }} /> Đang kiểm tra...</>
                              ) : (
                                <><Search className="w-4 h-4" /> Kiểm tra kết nối Zalo</>
                              )}
                            </button>
                          )}
                          {field.key === "zalo_access_token" && (
                            <button
                              type="button"
                              className="btn btn--style-secondary btn--size-medium"
                              onClick={handleRefreshToken}
                              disabled={refreshing}
                              style={{ display: "inline-flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", height: "46px", margin: 0, padding: "0 18px", borderRadius: "12px" }}
                            >
                              {refreshing ? (
                                <><span className="spinner" style={{ width: 14, height: 14 }} /> Đang làm mới...</>
                              ) : (
                                <><RefreshCw className="w-4 h-4" /> Làm mới Access Token</>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {field.key === "zalo_access_token" && (
                        <p style={{ fontSize: "0.85rem", color: "var(--warning)", marginTop: "4px" }}>
                          ⚠️ Access Token có thời hạn. Xem hướng dẫn tại{" "}
                          <a href="https://developers.zalo.me/docs/official-account" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>
                            Zalo Developers Docs ↗
                          </a>
                        </p>
                      )}
                      {field.key === "map_embed_url" && (
                        <p style={{ fontSize: "0.85rem", color: "var(--theme-text)", marginTop: "4px" }}>
                          ℹ️ Lấy link từ Google Maps → Chia sẻ → Nhúng bản đồ → Sao chép URL trong thẻ src.
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Kết quả kiểm tra Zalo */}
                {activeGroup.id === "zalo_integration" && testResult && (
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "14px 16px", borderRadius: "12px", marginTop: "16px",
                    background: testResult.success ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${testResult.success ? "#bbf7d0" : "#fecaca"}`,
                  }}>
                    <span style={{ fontSize: "1.2rem" }}>{testResult.success ? "✅" : "❌"}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: testResult.success ? "#15803d" : "#dc2626", marginBottom: "4px" }}>
                        {testResult.message}
                      </div>
                      {testResult.oa && (
                        <div style={{ fontSize: "0.9rem", color: "var(--theme-text)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <span>🏥 <strong>Tên OA:</strong> {testResult.oa.name}</span>
                          <span>🆔 <strong>OA ID:</strong> {testResult.oa.id}</span>
                          <span>👥 <strong>Người theo dõi:</strong> {testResult.oa.followers?.toLocaleString("vi-VN")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>

                {/* Preview bản đồ nếu có */}
                {activeGroup.id === "oa_display" && values["map_embed_url"] && (
                  <div style={{ marginTop: "16px" }}>
                    <div className="block font-semibold text-base mb-2 " style={{ marginBottom: "8px" }}>🗺️ Xem trước bản đồ</div>
                    <iframe
                      src={values["map_embed_url"]}
                      width="100%"
                      height="280"
                      style={{ border: "none", borderRadius: "12px", display: "block" }}
                      allowFullScreen
                      loading="lazy"
                      title="Google Maps Preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div style={{ 
        marginTop: "32px", padding: "16px 24px", 
        background: "var(--theme-elevation-50)", border: "1px solid var(--theme-elevation-150)", borderRadius: "16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ color: "var(--theme-text)", fontSize: "0.9rem" }}>
          Đừng quên lưu cài đặt sau khi thay đổi nhé.
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {saved && (
            <span style={{ color: "#22c55e", fontWeight: 600, fontSize: "1.1rem" }}>
              ✅ Đã lưu thành công!
            </span>
          )}
          <button className="btn btn--style-secondary btn--size-small" onClick={loadSettings}>🔄 Tải lại</button>
          <button className="btn btn--style-primary btn--size-small" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.4)", borderTopColor: "white" }} /> Đang lưu...</> : "💾 Lưu cài đặt"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "24px", textAlign: "center", color: "var(--theme-text)" }}>Đang tải cài đặt...</div>}>
      <div className="zalo-admin-view max-w-7xl mx-auto w-full">
        <SettingsPageContent />
      </div>
    </Suspense>
  );
}
