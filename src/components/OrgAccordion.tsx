'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type Member = {
  id?: string;
  memberName: string;
  position: string;
  academicTitle?: string;
  email?: string;
  bio?: string;
  avatar?: { url: string; alt?: string; width?: number; height?: number };
};

type OrgUnit = {
  id: string;
  name: string;
  unitType: string;
  shortDescription?: string;
  image?: { url: string; alt?: string };
  members?: Member[];
};

type Props = {
  units: OrgUnit[];
};

const POSITION_LABELS: Record<string, string> = {
  giam_doc: 'Giám đốc',
  pho_giam_doc: 'Phó Giám đốc',
  truong: 'Trưởng phòng/khoa',
  pho_truong: 'Phó Trưởng phòng/khoa',
  bac_si: 'Bác sĩ',
  y_si: 'Y sĩ',
  dieu_duong: 'Điều dưỡng',
  ky_thuat_vien: 'Kỹ thuật viên',
  duoc_si: 'Dược sĩ',
  can_bo: 'Cán bộ/Chuyên viên',
  nhan_vien: 'Nhân viên',
};

const ACADEMIC_LABELS: Record<string, string> = {
  gs: 'GS.',
  pgs: 'PGS.',
  ts: 'TS.',
  ths: 'ThS.',
  bsckii: 'BSCKII.',
  bscki: 'BSCKI.',
  bs: 'BS.',
  dsdh: 'DS.ĐH.',
  cn: 'CN.',
  none: '',
};

const TYPE_COLORS: Record<string, string> = {
  ban_lanh_dao: '#1565c0',
  phong: '#2e7d32',
  khoa: '#6a1b9a',
  khac: '#e65100',
};

function MemberCard({ member }: { member: Member }) {
  const positionLabel = POSITION_LABELS[member.position] || member.position;
  const academicLabel = member.academicTitle ? (ACADEMIC_LABELS[member.academicTitle] || '') : '';
  const isLeader = ['giam_doc', 'pho_giam_doc', 'truong', 'pho_truong'].includes(member.position);

  return (
    <div className={`member-card ${isLeader ? 'leader-card' : ''}`}>
      <div className="member-avatar">
        {member.avatar?.url ? (
          <Image
            src={member.avatar.url}
            alt={member.avatar.alt || member.memberName}
            width={80}
            height={80}
            className="avatar-img"
            style={{ objectFit: 'cover', borderRadius: '50%', width: 80, height: 80 }}
          />
        ) : (
          <div className="avatar-placeholder" aria-hidden="true">
            {member.memberName.charAt(0)}
          </div>
        )}
        {isLeader && <span className="leader-badge" title="Lãnh đạo">★</span>}
      </div>
      <div className="member-info">
        <div className="member-name">
          {academicLabel && <span className="academic-title">{academicLabel} </span>}
          {member.memberName}
        </div>
        <div className="member-position">{positionLabel}</div>
        {member.email && (
          <a href={`mailto:${member.email}`} className="member-email" title={`Gửi email cho ${member.memberName}`}>
            ✉ {member.email}
          </a>
        )}
        {member.bio && <p className="member-bio">{member.bio}</p>}
      </div>

      <style>{`
        .member-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .member-card:hover {
          border-color: #93c5fd;
          background: #eff6ff;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }
        .leader-card {
          background: linear-gradient(135deg, #eff6ff, #f0fdf4);
          border-color: #93c5fd;
        }
        .member-avatar {
          flex-shrink: 0;
          position: relative;
        }
        .avatar-placeholder {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1976d2, #42a5f5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 700;
        }
        .leader-card .avatar-placeholder {
          background: linear-gradient(135deg, #1565c0, #4caf50);
        }
        .leader-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: #f59e0b;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        .member-info {
          flex: 1;
          min-width: 0;
        }
        .member-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: #1e293b;
          margin-bottom: 0.15rem;
        }
        .academic-title {
          color: #3b82f6;
          font-weight: 600;
        }
        .member-position {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .member-email {
          font-size: 0.75rem;
          color: #2563eb;
          text-decoration: none;
          display: block;
          word-break: break-all;
        }
        .member-email:hover {
          text-decoration: underline;
        }
        .member-bio {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0.25rem 0 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

function AccordionItem({ unit, defaultOpen = false }: { unit: OrgUnit; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const color = TYPE_COLORS[unit.unitType] || '#455a64';
  const members = unit.members || [];
  const leaders = members.filter(m => ['giam_doc', 'pho_giam_doc', 'truong', 'pho_truong'].includes(m.position));
  const staff = members.filter(m => !['giam_doc', 'pho_giam_doc', 'truong', 'pho_truong'].includes(m.position));

  return (
    <div
      id={`accordion-${unit.id}`}
      className={`accordion-item ${isOpen ? 'open' : ''}`}
      style={{ '--unit-color': color } as React.CSSProperties}
    >
      <button
        className="accordion-trigger"
        onClick={() => setIsOpen(p => !p)}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${unit.id}`}
      >
        <div className="trigger-left">
          <span className="unit-dot" aria-hidden="true" />
          <span className="unit-name">{unit.name}</span>
          {members.length > 0 && (
            <span className="member-count-badge">{members.length} người</span>
          )}
        </div>
        <span className={`accordion-arrow ${isOpen ? 'rotated' : ''}`} aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <div id={`accordion-content-${unit.id}`} className="accordion-content">
          {unit.shortDescription && (
            <p className="unit-description">{unit.shortDescription}</p>
          )}

          {leaders.length > 0 && (
            <div className="member-group">
              <div className="member-group-title">Lãnh đạo đơn vị</div>
              <div className="members-grid">
                {leaders.map((m, i) => (
                  <MemberCard key={i} member={m} />
                ))}
              </div>
            </div>
          )}

          {staff.length > 0 && (
            <div className="member-group">
              <div className="member-group-title">Nhân sự</div>
              <div className="members-grid">
                {staff.map((m, i) => (
                  <MemberCard key={i} member={m} />
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && (
            <p className="no-members">Chưa có thông tin nhân sự.</p>
          )}
        </div>
      )}

      <style>{`
        .accordion-item {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          margin-bottom: 0.75rem;
          transition: box-shadow 0.2s;
        }
        .accordion-item.open {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border-color: var(--unit-color);
        }
        .accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: white;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .accordion-trigger:hover {
          background: #f8fafc;
        }
        .open .accordion-trigger {
          background: var(--unit-color);
          color: white;
        }
        .trigger-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        .unit-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--unit-color);
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .open .unit-dot {
          background: white;
        }
        .unit-name {
          font-weight: 700;
          font-size: 1rem;
          color: #1e293b;
          transition: color 0.15s;
        }
        .open .unit-name {
          color: white;
        }
        .member-count-badge {
          font-size: 0.72rem;
          background: color-mix(in srgb, var(--unit-color) 12%, transparent);
          color: var(--unit-color);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
          transition: all 0.15s;
        }
        .open .member-count-badge {
          background: rgba(255,255,255,0.25);
          color: white;
        }
        .accordion-arrow {
          color: #94a3b8;
          font-size: 0.7rem;
          transition: transform 0.2s;
        }
        .open .accordion-arrow {
          color: white;
        }
        .accordion-arrow.rotated {
          transform: rotate(180deg);
        }
        .accordion-content {
          padding: 1.25rem;
          border-top: 1px solid #e2e8f0;
          background: white;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .unit-description {
          font-size: 0.875rem;
          color: #475569;
          background: #f8fafc;
          border-left: 3px solid var(--unit-color);
          padding: 0.75rem 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 0 0 1rem;
          line-height: 1.6;
        }
        .member-group {
          margin-bottom: 1.25rem;
        }
        .member-group:last-child {
          margin-bottom: 0;
        }
        .member-group-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .member-group-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.75rem;
        }
        .no-members {
          text-align: center;
          color: #94a3b8;
          font-style: italic;
          font-size: 0.875rem;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}

export function OrgAccordion({ units }: Props) {
  const groups: Record<string, { label: string; units: OrgUnit[] }> = {
    ban_lanh_dao: { label: '🏛️ Ban Lãnh đạo', units: [] },
    phong: { label: '📋 Phòng chức năng', units: [] },
    khoa: { label: '🔬 Khoa chuyên môn', units: [] },
    khac: { label: '🏥 Đơn vị khác', units: [] },
  };

  units.forEach(u => {
    const key = u.unitType in groups ? u.unitType : 'khac';
    groups[key].units.push(u);
  });

  return (
    <div className="org-accordion">
      {Object.entries(groups)
        .filter(([, g]) => g.units.length > 0)
        .map(([key, group]) => (
          <div key={key} className="accordion-group">
            <h3 className="accordion-group-title">{group.label}</h3>
            {group.units.map((unit, i) => (
              <AccordionItem
                key={unit.id}
                unit={unit}
                defaultOpen={key === 'ban_lanh_dao' && i === 0}
              />
            ))}
          </div>
        ))}

      <style>{`
        .org-accordion {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .accordion-group {
          margin-bottom: 2rem;
        }
        .accordion-group:last-child {
          margin-bottom: 0;
        }
        .accordion-group-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #334155;
          margin: 0 0 0.875rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px dashed #e2e8f0;
        }
      `}</style>
    </div>
  );
}
