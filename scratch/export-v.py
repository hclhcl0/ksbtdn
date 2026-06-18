import sqlite3
import json

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

try:
    db = sqlite3.connect('D:/CDC/webcq/payload-data.db')
    db.row_factory = dict_factory
    
    # We exported 20 articles previously. Let's get their IDs
    with open('scratch/export-test-20.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        article_ids = [a['id'] for a in data['articles']]
    
    placeholders = ','.join(['?'] * len(article_ids))
    
    articles_v = db.execute(f"SELECT * FROM _articles_v WHERE parent_id IN ({placeholders})", article_ids).fetchall()
    
    v_ids = [v['id'] for v in articles_v]
    articles_v_rels = []
    if v_ids:
        v_placeholders = ','.join(['?'] * len(v_ids))
        articles_v_rels = db.execute(f"SELECT * FROM _articles_v_rels WHERE parent_id IN ({v_placeholders})", v_ids).fetchall()

    articles_rels = db.execute(f"SELECT * FROM articles_rels WHERE parent_id IN ({placeholders})", article_ids).fetchall()
        
    export_data = {
        '_articles_v': articles_v,
        '_articles_v_rels': articles_v_rels,
        'articles_rels': articles_rels
    }
    
    with open('scratch/export-test-20-v.json', 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
        
    print(f"Exported {len(articles_v)} _articles_v, {len(articles_v_rels)} _articles_v_rels, {len(articles_rels)} articles_rels!")
except Exception as e:
    print("Error:", e)
