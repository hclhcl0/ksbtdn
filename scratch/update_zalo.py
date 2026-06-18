import re

with open('src/components/views/ZaloSettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
if 'import ApiKeysTab' not in content:
    content = content.replace('import { Bot, Mail, MessageCircle, Settings, Edit, Link, Plus, Trash2, Shield, FileText, CheckCircle, Smartphone, MapPin, Eye, EyeOff } from "lucide-react";', 
    'import { Bot, Mail, MessageCircle, Settings, Edit, Link, Plus, Trash2, Shield, FileText, CheckCircle, Smartphone, MapPin, Eye, EyeOff, Book, Key } from "lucide-react";\nimport ApiKeysTab from "./tabs/ApiKeysTab";\nimport AiKnowledgeTab from "./tabs/AiKnowledgeTab";')

# 2. Add to SETTING_GROUPS
groups_target = '    },\n    {\n      id: "ai_data",'
new_groups = """    },
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
    content = content.replace(groups_target, new_groups)

# 3. Remove state and fetch functions
state_start = "  const [geminiKeys, setGeminiKeys] = useState<any[]>([]);"
state_end = "    if (!confirm(\"Bạn có chắc muốn xóa Groq Key này không?\")) return;\n    const res = await fetch(`/api/zalo-admin/settings/groq-keys?id=${id}`, { method: \"DELETE\" });\n    const json = await res.json();\n    if (json.success) {\n      fetchGroqKeys();\n    } else {\n      alert(\"Lỗi: \" + json.error);\n    }\n  };"

content = re.sub(r'  const \[geminiKeys, setGeminiKeys\] = useState<any\[\]>\(\[\]\);.*?(?:fetchGroqKeys\(\);\n    \} else \{\n      alert\("Lỗi: " \+ json\.error\);\n    \}\n  \};\n)', '', content, flags=re.DOTALL)

# Remove useEffect calls for fetching keys
content = re.sub(r'    fetchGeminiKeys\(\);\n    fetchGroqKeys\(\);\n', '', content)

# 4. Replace the UI rendering inside the switch/if block
# Find the exact string that renders the Gemini and Groq UI and remove it
ui_to_remove_start = "{/* UI cho tab Gemini AI Keys */}"
ui_to_remove_end = "{/* Groq Keys Section */}"

content = re.sub(r'\{\/\* UI cho tab Gemini AI Keys \*\/\}.*?\{\/\* Groq Keys Section \*\/\}.*?<\/div>\n        <\/div>\n\n      <\/div>\n    <\/div>\n  \)\}\n', '}\n', content, flags=re.DOTALL)


# 5. Inject the render for new tabs
render_target = '        {activeGroup.id !== "oa_display" && activeGroup.id !== "messaging_tools" && activeGroup.id !== "zalo_integration" && activeGroup.id !== "ai_data" && ('
new_render = """        {activeGroup.id === "ai_knowledge" && <AiKnowledgeTab />}
        {activeGroup.id === "api_keys" && <ApiKeysTab />}
        {activeGroup.id !== "oa_display" && activeGroup.id !== "messaging_tools" && activeGroup.id !== "zalo_integration" && activeGroup.id !== "ai_data" && activeGroup.id !== "ai_knowledge" && activeGroup.id !== "api_keys" && ("""
if 'activeGroup.id === "ai_knowledge"' not in content:
    content = content.replace(render_target, new_render)

with open('src/components/views/ZaloSettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ZaloSettingsView.tsx successfully")
