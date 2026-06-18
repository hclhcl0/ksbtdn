import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic replacements for "white" backgrounds
    content = content.replace('background: "white"', 'background: "var(--theme-elevation-50)"')
    content = content.replace('background: white;', 'background: var(--theme-elevation-50);')
    content = content.replace('background: isOAuth2 ? "#f0fdf4" : "white"', 'background: isOAuth2 ? "rgba(34, 197, 94, 0.05)" : "var(--theme-elevation-50)"')
    
    # Specific color replacements
    content = content.replace('background: "#fffbeb"', 'background: "rgba(245, 158, 11, 0.1)"')
    content = content.replace('border: "1px solid #fde68a"', 'border: "1px solid rgba(245, 158, 11, 0.3)"')
    content = content.replace('color: "#78350f"', 'color: "var(--warning)"')
    
    content = content.replace('background: "#f0fdf4"', 'background: "rgba(34, 197, 94, 0.1)"')
    content = content.replace('border: "1px solid #bbf7d0"', 'border: "1px solid rgba(34, 197, 94, 0.3)"')
    content = content.replace('color: "#14532d"', 'color: "var(--success)"')
    
    # Tooltip / badge text colors
    content = content.replace('color: "white"', 'color: "#fff"')

    # Fix addMode toggle
    content = content.replace('addMode === m.id ? "white" : "transparent"', 'addMode === m.id ? "var(--theme-elevation-200)" : "transparent"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/components/views/ZaloSettingsView.tsx')
fix_file('src/components/views/tabs/ApiKeysTab.tsx')

print("Dark mode colors fixed")
