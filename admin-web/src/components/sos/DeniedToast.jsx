import PropTypes from 'prop-types';

export function DeniedToast({ team, victim, onClose }) {
  const victimName = victim?.victimName || 'Nguyễn Vũ Huy';
  const victimPhone = formatPhone(victim?.victimPhone || victim?.phone || '0373224840');
  const teamName = team?.name || 'Công an Thành phố Đà Nẵng';
  // Lấy reason từ team, nếu không có thì để mặc định theo thiết kế
  const reason = team?.reason || 'Qua xác minh, không có dấu hiệu nguy hiểm tại hiện trường (Báo động giả).';

  return (
    <div style={cardStyle}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <WarningIcon color="#DC2626" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Quản lý Cứu hộ</span>
        </div>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          <button type="button" style={iconBtn} title="Tuỳ chọn">···</button>
          <button type="button" style={iconBtn} onClick={onClose} aria-label="Đóng">✕</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={bodyStyle}>
        {/* Status icon */}
        <div style={statusIconWrap}>
          <CloseIcon />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>
            Yêu cầu bị từ chối
          </div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>{teamName}</span> từ chối nhiệm vụ giải cứu {victimName} {victimPhone ? `(${victimPhone})` : ''}.
          </div>
          
          {/* Reason Box */}
          <div style={reasonBoxStyle}>
            <span style={{ fontWeight: 600, color: '#B91C1C' }}>Lý do:</span>{' '}
            <span style={{ color: '#B91C1C' }}>{reason}</span>
          </div>

          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '10px' }}>
            Vừa xong • Cập nhật hệ thống
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={footerStyle}>
        <button type="button" style={secBtnStyle} onClick={onClose}>Đóng</button>
        <button type="button" style={primaryBtnStyle}>
          Xem chi tiết từ chối
        </button>
      </div>
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

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
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
  width: '320px',
  background: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  fontFamily: 'Roboto, sans-serif',
  overflow: 'hidden',
  border: '1px solid #F0F2F5',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: '#FFFFFF',
  borderBottom: '1px solid #F0F2F5',
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
  gap: '12px',
  padding: '16px 14px 4px 14px',
  alignItems: 'flex-start',
};

const statusIconWrap = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: '#FEE2E2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const reasonBoxStyle = {
  background: '#FEF2F2',
  borderLeft: '3px solid #DC2626',
  padding: '8px 10px',
  borderRadius: '0 4px 4px 0',
  fontSize: '12px',
  lineHeight: 1.4,
};

const footerStyle = {
  display: 'flex',
  gap: '8px',
  padding: '16px 14px',
};

const secBtnStyle = {
  flex: 1,
  padding: '9px 0',
  borderRadius: '6px',
  border: 'none',
  background: '#F3F4F6',
  color: '#374151',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

const primaryBtnStyle = {
  flex: 2,
  padding: '9px 0',
  borderRadius: '6px',
  border: 'none',
  background: '#2563EB',
  color: '#FFFFFF',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

DeniedToast.propTypes = {
  team: PropTypes.object.isRequired,
  victim: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
DeniedToast.defaultProps = { victim: null };
