import re

with open('src/components/views/ZaloSettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_tabs = """    },
    {
      id: "ai_knowledge",
      icon: <Book className="w-5 h-5" />,
      title: "Kho tri thức AI",
      desc: "Quản lý tài liệu và dữ liệu huấn luyện cho AI.",
      fields: []
    },
    {
      id: "api_keys",
      icon: <Key className="w-5 h-5" />,
      title: "Danh sách API Keys",
      desc: "Quản lý và cấu hình các API Key cho Gemini, Groq.",
      fields: []
    },
    {
      id: "ai_data","""

if 'id: "ai_knowledge"' not in content:
    content = re.sub(r'    \},\s*\{\s*id: "ai_data",', new_tabs, content)
    with open('src/components/views/ZaloSettingsView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Tabs injected')
else:
    print('Tabs already present')
