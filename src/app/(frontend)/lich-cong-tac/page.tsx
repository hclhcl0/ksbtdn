export const dynamic = 'force-dynamic';

import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, MapPin, Users, User } from 'lucide-react';
import styles from './WorkSchedules.module.css';

export const metadata = {
  title: 'Lịch công tác | CDC Đà Nẵng',
};

async function getWorkSchedules() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'work-schedules',
      sort: 'date',
      limit: 100,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching work schedules:", error);
    return [];
  }
}

export default async function WorkSchedulesPage() {
  const schedules = await getWorkSchedules();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className={`${styles.statusBadge} ${styles.statusUpcoming}`}>Sắp diễn ra</span>;
      case 'ongoing':
        return <span className={`${styles.statusBadge} ${styles.statusOngoing}`}>Đang diễn ra</span>;
      case 'completed':
        return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Đã hoàn thành</span>;
      case 'cancelled':
        return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <h1 className={styles.pageTitle}>LỊCH CÔNG TÁC</h1>
      <p className={styles.subtitle}>Cập nhật lịch làm việc, hội họp, công tác của Trung tâm Kiểm soát bệnh tật Đà Nẵng.</p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.textCenter} style={{ width: '120px' }}>Thời gian</th>
              <th>Nội dung / Tiêu đề</th>
              <th>Địa điểm</th>
              <th>Chủ trì / Thành phần</th>
              <th className={styles.textCenter}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={5} className={`${styles.textCenter} py-8`}>Chưa có lịch công tác nào.</td>
              </tr>
            ) : (
              schedules.map((schedule: any) => {
                const dateObj = new Date(schedule.date);
                const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('vi-VN');
                
                return (
                  <tr key={schedule.id}>
                    <td className={`${styles.textCenter} align-top`}>
                      <div className="font-bold text-lg text-primary">{timeStr}</div>
                      <div className="text-sm text-gray-500">{dateStr}</div>
                    </td>
                    <td className="align-top">
                      <div className={styles.fontSemibold}>{schedule.title}</div>
                      {/* Note: In a real app we might render richText schedule.content here */}
                    </td>
                    <td className="align-top">
                      {schedule.location && (
                        <div className="flex items-start gap-1 text-gray-700 mt-1">
                          <MapPin size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm">{schedule.location}</span>
                        </div>
                      )}
                    </td>
                    <td className="align-top">
                      {schedule.chairperson && (
                        <div className="flex items-start gap-1 text-gray-700 mt-1">
                          <User size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm"><strong>Chủ trì:</strong> {schedule.chairperson}</span>
                        </div>
                      )}
                      {schedule.participants && (
                        <div className="flex items-start gap-1 text-gray-700 mt-1">
                          <Users size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm"><strong>TP:</strong> {schedule.participants}</span>
                        </div>
                      )}
                    </td>
                    <td className={`${styles.textCenter} align-top`}>
                      {getStatusBadge(schedule.status)}
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
