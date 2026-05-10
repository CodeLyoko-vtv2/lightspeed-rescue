import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/** Hiện khi team được điều động — 2 giai đoạn: dispatched → completed (sau delay) */
export function DispatchToast({ team, victim, onClose, completionDelayMs = 12000 }) {
  const [phase, setPhase] = useState('dispatched'); // 'dispatched' | 'completed'
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('completed'), completionDelayMs);
    return () => clearTimeout(t);
  }, [completionDelayMs]);

  const victimName = victim?.victimName || 'nạn nhân';
  const victimPhone = formatPhone(victim?.victimPhone || victim?.phone || '');
  const teamName = team?.name || 'Đội cứu hộ';

  const isCompleted = phase === 'completed';

  return (
    <div style={cardStyle}>
      {/* ── Header ── */}
      <div style={headerStyle(isCompleted)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isCompleted
            ? <WarningIcon color="#15803D" />
            : <WarningIcon color="#1D4ED8" />}
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
            {isCompleted ? 'Quản lý Cứu hộ' : 'Hệ thống Điều phối'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          <button type="button" style={iconBtn} title="Tuỳ chọn">···</button>
          <button
            type="button"
            style={iconBtn}
            onClick={() => setMinimized((v) => !v)}
            aria-label={minimized ? 'Mở rộng' : 'Thu nhỏ'}
          >
            {minimized ? '▲' : '▼'}
          </button>
          <button type="button" style={iconBtn} onClick={onClose} aria-label="Đóng">✕</button>
        </div>
      </div>

      {/* ── Body (collapsible) ── */}
      {!minimized && (
        <>
          <div style={bodyStyle}>
            {/* Status icon */}
            <div style={statusIconWrap(isCompleted)}>
              {isCompleted
                ? <CheckIcon />
                : <InfoIcon />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isCompleted ? '#15803D' : '#1D4ED8', marginBottom: '3px' }}>
                {isCompleted ? 'Nhiệm vụ hoàn thành' : 'Đã tiếp nhận nhiệm vụ'}
              </div>
              <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                {isCompleted
                  ? `${teamName} đã hoàn thành nhiệm vụ giải cứu ${victimName}${victimPhone ? ` ${victimPhone}` : ''}.`
                  : `${teamName} đã nhận nhiệm vụ giải cứu ${victimName}${victimPhone ? ` ${victimPhone}` : ''}.`}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                Vừa xong •{' '}
                <span style={{ color: isCompleted ? '#15803D' : '#1D4ED8', fontWeight: 500 }}>
                  {isCompleted ? 'Lưu trữ hồ sơ' : 'Đang di chuyển đến hiện trường'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={footerStyle}>
            <button type="button" style={secBtnStyle} onClick={onClose}>Đóng</button>
            <button type="button" style={primaryBtnStyle}>
              {isCompleted ? 'Xem báo cáo kết thúc' : 'Theo dõi lộ trình'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Icon helpers ── */
function WarningIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  );
}
WarningIcon.propTypes = { color: PropTypes.string.isRequired };

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#15803D">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#2563EB">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  return n;
}

/* ── Styles ── */
const cardStyle = {
  position: 'absolute',
  bottom: '24px',
  left: '16px',
  zIndex: 1000,
  width: '310px',
  background: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
  fontFamily: 'Roboto, sans-serif',
  overflow: 'hidden',
  border: '1px solid #F0F2F5',
};

const headerStyle = (isCompleted) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: isCompleted ? '#F0FDF4' : '#EFF6FF',
  borderBottom: '1px solid #F0F2F5',
});

const iconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#6B7280',
  width: '22px',
  height: '22px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '4px',
  padding: 0,
};

const bodyStyle = {
  display: 'flex',
  gap: '10px',
  padding: '12px 14px',
  alignItems: 'flex-start',
};

const statusIconWrap = (isCompleted) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: isCompleted ? '#DCFCE7' : '#DBEAFE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const footerStyle = {
  display: 'flex',
  gap: '8px',
  padding: '8px 14px 14px',
};

const secBtnStyle = {
  flex: 1,
  padding: '8px 0',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  background: '#F3F4F6',
  color: '#374151',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

const primaryBtnStyle = {
  flex: 2,
  padding: '8px 0',
  borderRadius: '8px',
  border: 'none',
  background: '#2563EB',
  color: '#FFFFFF',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

DispatchToast.propTypes = {
  team: PropTypes.object.isRequired,
  victim: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  completionDelayMs: PropTypes.number,
};
DispatchToast.defaultProps = { victim: null, completionDelayMs: 12000 };
