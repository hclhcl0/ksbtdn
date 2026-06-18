import json

with open('scratch/found-text.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('scratch/unicode-output.txt', 'w', encoding='utf-8') as out:
    def find_text(node):
        if isinstance(node, dict):
            if node.get('type') == 'text' and '13 hành vi' in node.get('text', ''):
                text = node['text']
                for i, c in enumerate(text):
                    out.write(f"Char {i}: '{c}' (U+{ord(c):04X})\n")
                return True
            for v in node.values():
                if find_text(v): return True
        elif isinstance(node, list):
            for item in node:
                if find_text(item): return True
        return False

    find_text(data)
