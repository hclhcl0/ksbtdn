'use client';

import React, { useState } from 'react';

type OrgUnit = {
  id: string;
  name: string;
  unitType: 'ban_lanh_dao' | 'phong' | 'khoa' | 'khac';
  order: number;
  shortDescription?: string;
  members?: Array<{
    memberName: string;
    position: string;
    academicTitle?: string;
    avatar?: { url: string; alt?: string };
  }>;
};

type Props = {
  units: OrgUnit[];
};

const TYPE_COLORS: Record<string, string> = {
  ban_lanh_dao: '#1565c0',
  phong: '#2e7d32',
  khoa: '#6a1b9a',
  khac: '#e65100',
};

const TYPE_LABELS: Record<string, string> = {
  ban_lanh_dao: 'Ban Lãnh đạo',
  phong: 'Phòng',
  khoa: 'Khoa',
  khac: 'Đơn vị khác',
};

function OrgNode({ unit, isActive, onClick }: { unit: OrgUnit; isActive: boolean; onClick: () => void }) {
  const color = TYPE_COLORS[unit.unitType] || '#455a64';
  const memberCount = unit.members?.length || 0;
  const leaders = unit.members?.filter(m =>
    ['giam_doc', 'pho_giam_doc', 'truong', 'pho_truong'].includes(m.position)
  ) || [];

  return (
    <button
      id={`org-node-${unit.id}`}
      className={`org-node ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ '--node-color': color } as React.CSSProperties}
      aria-pressed={isActive}
      title={`Xem nhân sự ${unit.name}`}
    >
      <div className="node-header">
        <span className="node-type-badge">{TYPE_LABELS[unit.unitType]}</span>
      </div>
      <div className="node-name">{unit.name}</div>
      {leaders.length > 0 && (
        <div className="node-leader">
          {leaders.map((l, i) => (
            <span key={i} className="leader-name">{l.memberName}</span>
          ))}
        </div>
      )}
      {memberCount > 0 && (
        <div className="node-count">{memberCount} nhân sự</div>
      )}

      <style>{`
        .org-node {
          background: white;
          border: 2px solid var(--node-color);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          min-width: 150px;
          max-width: 200px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          position: relative;
        }
        .org-node:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          background: var(--node-color);
          color: white;
        }
        .org-node.active {
          background: var(--node-color);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .node-header {
          margin-bottom: 0.25rem;
        }
        .node-type-badge {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--node-color);
          background: color-mix(in srgb, var(--node-color) 12%, transparent);
          padding: 2px 6px;
          border-radius: 999px;
          display: inline-block;
        }
        .org-node:hover .node-type-badge,
        .org-node.active .node-type-badge {
          color: white;
          background: rgba(255,255,255,0.25);
        }
        .node-name {
          font-size: 0.85rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 0.25rem 0;
          color: #1a237e;
        }
        .org-node:hover .node-name,
        .org-node.active .node-name {
          color: white;
        }
        .leader-name {
          font-size: 0.72rem;
          display: block;
          opacity: 0.75;
        }
        .node-count {
          font-size: 0.7rem;
          margin-top: 0.25rem;
          opacity: 0.6;
          font-style: italic;
        }
      `}</style>
    </button>
  );
}

export function OrgChart({ units }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleNodeClick = (unitId: string) => {
    setActiveId(prev => prev === unitId ? null : unitId);
    // Cuộn xuống accordion tương ứng
    setTimeout(() => {
      const el = document.getElementById(`accordion-${unitId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.querySelector('button')?.click();
      }
    }, 100);
  };

  const leadership = units.filter(u => u.unitType === 'ban_lanh_dao');
  const departments = units.filter(u => u.unitType !== 'ban_lanh_dao');
  const deptGroups: Record<string, OrgUnit[]> = {};
  departments.forEach(d => {
    if (!deptGroups[d.unitType]) deptGroups[d.unitType] = [];
    deptGroups[d.unitType].push(d);
  });

  return (
    <div className="org-chart">
      {/* Root: Ban lãnh đạo */}
      {leadership.length > 0 && (
        <div className="org-level leadership-level">
          {leadership.map(unit => (
            <OrgNode
              key={unit.id}
              unit={unit}
              isActive={activeId === unit.id}
              onClick={() => handleNodeClick(unit.id)}
            />
          ))}
        </div>
      )}

      {/* Connector lines */}
      {leadership.length > 0 && departments.length > 0 && (
        <div className="connector-v" aria-hidden="true" />
      )}

      {/* Departments grouped by type */}
      {Object.entries(deptGroups).map(([type, group]) => (
        <div key={type} className="dept-group">
          <div className="dept-group-label" style={{ color: TYPE_COLORS[type] }}>
            {TYPE_LABELS[type]}
          </div>
          <div className="org-level dept-level">
            {group.map(unit => (
              <OrgNode
                key={unit.id}
                unit={unit}
                isActive={activeId === unit.id}
                onClick={() => handleNodeClick(unit.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <p className="org-chart-hint" aria-live="polite">
        👆 Click vào ô để xem danh sách nhân sự
      </p>

      <style>{`
        .org-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          overflow-x: auto;
          padding: 0.5rem;
        }
        .org-level {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
        }
        .leadership-level {
          gap: 1rem;
          margin-bottom: 0;
        }
        .connector-v {
          width: 3px;
          height: 2rem;
          background: linear-gradient(to bottom, #1565c0, #e2e8f0);
          border-radius: 2px;
          margin: 0.25rem 0;
        }
        .dept-group {
          width: 100%;
          margin-top: 1.5rem;
        }
        .dept-group-label {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dept-group-label::before,
        .dept-group-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: currentColor;
          opacity: 0.2;
        }
        .dept-level {
          justify-content: center;
        }
        .org-chart-hint {
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
