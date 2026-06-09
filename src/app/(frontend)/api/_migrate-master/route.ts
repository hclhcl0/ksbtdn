import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

// --- TIỆN ÍCH DỊCH CHUỖI ---
function decodeHTMLEntities(text: string) {
    if (!text) return text;
    const entities: Record<string, string> = {
        '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
        '&quot;': '"', '&#39;': "'", '&#x3A;': ':', '&#x3a;': ':',
        '&ldquo;': '“', '&rdquo;': '”', '&lsquo;': '‘', '&rsquo;': '’',
        '&ndash;': '–', '&mdash;': '—', '&hellip;': '…'
    };
    return text.replace(/&[#a-zA-Z0-9]+;/g, (match) => {
        if (entities[match]) return entities[match];
        if (match.toLowerCase().startsWith('&#x')) return String.fromCharCode(parseInt(match.slice(3, -1), 16));
        if (match.startsWith('&#')) return String.fromCharCode(parseInt(match.slice(2, -1), 10));
        return match;
    });
}

function generateSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a')
        .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i')
        .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[úùủũụưứừửữự]/g, 'u')
        .replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function parseSqlRow(rowStr: string) {
    const cols = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;
    
    for (let i = 0; i < rowStr.length; i++) {
        let char = rowStr[i];
        if (escapeNext) {
            current += char;
            escapeNext = false;
            continue;
        }
        if (char === '\') 
<truncated 22489 bytes>