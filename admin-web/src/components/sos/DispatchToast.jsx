import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Hiện khi team được điều động — 3 giai đoạn:
 *   dispatched (Đã tiếp nhận nhiệm vụ)
 *     → updating (Cập nhật trạng thái)  — sau 3.5s
 *     → completed (Nhiệm vụ hoàn thành)  — sau completionDelayMs tổng cộng
 */
export function DispatchToast({
  team,
  victim,
  onClose,
  onMissionComplete,
  completionDelayMs = 12000,
  initialPhase = 'dispatched',
  autoProgress = true,
}) {
  const [phase, setPhase] = useState(initialPhase); // 'dispatched' | 'updating' | 'completed'
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!autoProgress || initialPhase === 'completed') return undefined;
    // Sau 3.5s: chuyển sang "Đối cập nhật trạng thái"
    const t1 = setTimeout(() => setPhase('updating'), 3500);
    // Sau completionDelayMs: "Đã hoàn thành nhiệm vụ"
    const t2 = setTimeout(() => {
      setPhase('completed');
      onMissionComplete?.();
    }, completionDelayMs);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [autoProgress, completionDelayMs, initialPhase, onMissionComplete]);

  const victimName = victim?.victimName || 'nạn nhân';
  const victimPhone = formatPhone(victim?.victimPhone || victim?.phone || '');
  const teamName = team?.name || 'Đội cứu hộ';

  const isCompleted = phase === 'completed';
  const isUpdating  = phase === 'updating';

  /* Config hiển thị theo phase */
  const phaseConfig = {
    dispatched: {
      headerBg:   '#EFF6FF',
      headerIcon: '#1D4ED8',
      headerText: 'Hệ thống Điều phối',
      iconBg:     '#DBEAFE',
      titleColor: '#1D4ED8',
      title:      'Đã tiếp nhận nhiệm vụ',
      body:       `${teamName} đã nhận nhiệm vụ giải cứu ${victimName}${victimPhone ? ` ${victimPhone}` : ''}.`,
      sub:        'Đang di chuyển đến hiện trường',
      subColor:   '#1D4ED8',
      btnPrimary: 'Theo dõi lộ trình',
    },
    updating: {
      headerBg:   '#FFF7ED',
      headerIcon: '#D97706',
      headerText: 'Hệ thống Điều phối',
      iconBg:     '#FEF3C7',
      titleColor: '#D97706',
      title:      'Cập nhật trạng thái',
      body:       `${teamName} đang xử lý tình huống tại hiện trường.`,
      sub:        'Đang thực hiện nhiệm vụ',
      subColor:   '#D97706',
      btnPrimary: 'Theo dõi lộ trình',
    },
    completed: {
      headerBg:   '#F0FDF4',
      headerIcon: '#15803D',
      headerText: 'Quản lý Cứu hộ',
      iconBg:     '#DCFCE7',
      titleColor: '#15803D',
      title:      'Nhiệm vụ hoàn thành',
      body:       `${teamName} đã hoàn thành nhiệm vụ giải cứu ${victimName}${victimPhone ? ` ${victimPhone}` : ''}.`,
      sub:        'Lưu trữ hồ sơ',
      subColor:   '#15803D',
      btnPrimary: 'Xem báo cáo kết thúc',
    },
  }[phase];

  return (
    <div style={cardStyle}>
      {/* ── Header ── */}
      <div style={{ ...headerBaseStyle, background: phaseConfig.headerBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <WarningIcon color={phaseConfig.headerIcon} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
            {phaseConfig.headerText}
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
            <div style={{ ...statusIconWrapBase, background: phaseConfig.iconBg }}>
              {isCompleted ? <CheckIcon /> : isUpdating ? <UpdateIcon /> : <InfoIcon />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: phaseConfig.titleColor, marginBottom: '3px' }}>
                {phaseConfig.title}
              </div>
              <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                {phaseConfig.body}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                Vừa xong •{' '}
                <span style={{ color: phaseConfig.subColor, fontWeight: 500 }}>
                  {phaseConfig.sub}
                </span>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={footerStyle}>
            <button type="button" style={secBtnStyle} onClick={onClose}>Đóng</button>
            <button type="button" style={{ ...primaryBtnStyle, background: isCompleted ? '#15803D' : '#2563EB' }}>
              {phaseConfig.btnPrimary}
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

function UpdateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#D97706">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
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

const headerBaseStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  borderBottom: '1px solid #F0F2F5',
  transition: 'background 400ms ease',
};

const statusIconWrapBase = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 400ms ease',
};

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
  onMissionComplete: PropTypes.func,
  completionDelayMs: PropTypes.number,
  initialPhase: PropTypes.oneOf(['dispatched', 'updating', 'completed']),
  autoProgress: PropTypes.bool,
};
DispatchToast.defaultProps = {
  victim: null,
  onMissionComplete: null,
  completionDelayMs: 12000,
  initialPhase: 'dispatched',
  autoProgress: true,
};
