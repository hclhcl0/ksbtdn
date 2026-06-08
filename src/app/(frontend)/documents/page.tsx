export const dynamic = 'force-dynamic';

import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { FileText, Download } from 'lucide-react';
import styles from './Documents.module.css';

export const metadata = {
  title: 'Văn bản chỉ đạo điều hành | HCDC',
};

async function getDocuments() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'documents',
      sort: '-publishedDate',
      limit: 50,
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="container py-8">
      <h1 className={styles.pageTitle}>VĂN BẢN CHỈ ĐẠO ĐIỀU HÀNH</h1>
      <p className={styles.subtitle}>Hệ thống tra cứu các văn bản quy phạm pháp luật, chỉ đạo, điều hành của Sở Y Tế và HCDC.</p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.textCenter}>STT</th>
              <th>Số hiệu</th>
              <th>Trích yếu (Tên văn bản)</th>
              <th>Cơ quan BH</th>
              <th className={styles.textCenter}>Ngày BH</th>
              <th className={styles.textCenter}>Tải về</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${styles.textCenter} py-4`}>Chưa có văn bản nào được đăng tải.</td>
              </tr>
            ) : (
              documents.map((doc: any, index: number) => {
                const date = new Date(doc.publishedDate).toLocaleDateString('vi-VN');
                const fileUrl = doc.file?.url;
                
                return (
                  <tr key={doc.id}>
                    <td className={styles.textCenter}>{index + 1}</td>
                    <td className={styles.fontSemibold}>{doc.documentNumber}</td>
                    <td>
                      <div className="flex items-start gap-2">
                        <FileText size={18} className={`${styles.textPrimary} mt-1 flex-shrink-0`} />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td>{doc.issuer}</td>
                    <td className={styles.textCenter}>{date}</td>
                    <td className={styles.textCenter}>
                      {fileUrl ? (
                        <a href={fileUrl} target="_blank" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                          <Download size={14} /> Tải PDF
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
