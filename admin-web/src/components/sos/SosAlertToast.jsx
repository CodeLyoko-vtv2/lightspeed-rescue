import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ALERT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E53E3E">
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
  </svg>
);

const WARNING_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
  </svg>
);

function formatRelativeTime(createdAt) {
  const diff = Date.now() - createdAt;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  return `${Math.floor(diff / 3600000)} giờ trước`;
}

function getDescription(sos) {
  const name = sos.victimName || 'Nạn nhân';
  const phone = sos.victimPhone || sos.phone || '';
  const fmtPhone = phone.startsWith('0') ? `(+84) ${phone.slice(1)}` : phone;
  const addr = sos.address || sos.locationAddress || sos.victimAddress || '';
  return `${name}${fmtPhone ? ` ${fmtPhone}` : ''}, đang phát tín hiệu cầu cứu${addr ? `, ${addr}` : ''}`;
}

export function SosAlertToast({ sos, onViewOnMap, onDismiss }) {
  const [hidden, setHidden] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Simulate "Vừa xong" timestamp  
  const createdAt = sos._fakeCreatedAt || (Date.now() - 5000);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  if (hidden) return null;

  const desc = getDescription(sos);
  const shortDesc = desc.length > 80 ? `${desc.slice(0, 80)}...` : desc;

  return (
    <div
      style={{
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
        transition: 'all 200ms ease',
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {WARNING_ICON}
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
            Cảnh báo Khẩn cấp
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {/* Minimize */}
          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={() => setMinimized((v) => !v)}
            style={iconBtn}
          >
            —
          </button>
          {/* Close */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setHidden(true)}
            style={iconBtn}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body — collapsible */}
      {!minimized && (
        <>
          <div style={bodyStyle}>
            {/* Alert icon */}
            <div style={alertIconWrap}>{ALERT_ICON}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#E53E3E', marginBottom: '3px' }}>
                Tín hiệu khẩn cấp (SOS)
              </div>
              <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                {shortDesc}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                {formatRelativeTime(createdAt)} •{' '}
                <span style={{ color: '#E53E3E', fontWeight: 500 }}>Cần hỗ trợ ngay</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={footerStyle}>
            <button
              type="button"
              onClick={() => setHidden(true)}
              style={secBtnStyle}
            >
              Tạm ẩn
            </button>
            <button
              type="button"
              onClick={() => {
                onViewOnMap(sos);
                setHidden(true);
              }}
              style={primaryBtnStyle}
            >
              Xem trên bản đồ
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Styles ── */
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: '#F9FAFB',
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
  gap: '10px',
  padding: '12px 14px',
  alignItems: 'flex-start',
};

const alertIconWrap = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: '#FEF2F2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const footerStyle = {
  display: 'flex',
  gap: '8px',
  padding: '10px 14px 14px',
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

SosAlertToast.propTypes = {
  sos: PropTypes.object.isRequired,
  onViewOnMap: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
};
SosAlertToast.defaultProps = { onDismiss: null };
