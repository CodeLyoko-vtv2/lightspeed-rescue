import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/** State machine: idle → pending → active */
const DISPATCH_STATES = {
  IDLE:    'idle',
  PENDING: 'pending',  // "Chờ phản hồi..."
  ACTIVE:  'active',   // "Đang thực hiện nhiệm vụ"
};

const INVISIBLE_ICON = L.divIcon({
  className: '',
  html: '',
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0') || n.startsWith('02')) return `(+84) ${n.slice(1)}`;
  return n;
}

export function TeamPopup({ team, position, onClose, onDispatched }) {
  const markerRef = useRef(null);
  const [dispatchState, setDispatchState] = useState(DISPATCH_STATES.IDLE);

  useEffect(() => {
    const t = setTimeout(() => markerRef.current?.openPopup(), 60);
    return () => clearTimeout(t);
  }, [team?.id]);

  // State machine transitions
  const handleDispatch = () => {
    if (dispatchState !== DISPATCH_STATES.IDLE) return;
    setDispatchState(DISPATCH_STATES.PENDING);

    // Sau 2.5s: chuyển sang ACTIVE
    setTimeout(() => {
      setDispatchState(DISPATCH_STATES.ACTIVE);
      onDispatched?.(team);
    }, 2500);
  };

  if (!team || !position) return null;

  const phone = formatPhone(team.phone);
  const btnLabel = {
    [DISPATCH_STATES.IDLE]:    'Điều động cứu hộ',
    [DISPATCH_STATES.PENDING]: 'Chờ phản hồi...',
    [DISPATCH_STATES.ACTIVE]:  'Đang thực hiện nhiệm vụ...',
  }[dispatchState];

  const btnDisabled = dispatchState !== DISPATCH_STATES.IDLE;
  const btnBg = dispatchState === DISPATCH_STATES.IDLE ? '#2563EB' : '#6B7280';

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={INVISIBLE_ICON}
      zIndexOffset={1100}
    >
      <Popup
        className="team-popup"
        closeButton={false}
        autoPan={false}
        offset={[0, -60]}
      >
        <div style={wrapStyle}>
          {/* Nút X */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={closeBtnStyle}
            aria-label="Đóng"
          >
            ✕
          </button>

          {/* Tên đội (xanh đậm) */}
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A5DC8', marginBottom: '6px', paddingRight: '24px' }}>
            {team.name || 'Đội cứu hộ'}
          </div>

          {/* Số điện thoại */}
          {phone ? (
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
              {phone}
            </div>
          ) : null}

          {/* Địa chỉ */}
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px', lineHeight: 1.5 }}>
            {team.address || ''}
          </div>

          {/* Nút Điều động */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDispatch(); }}
            disabled={btnDisabled}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: btnBg,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: btnDisabled ? 'not-allowed' : 'pointer',
              fontFamily: 'Roboto, sans-serif',
              transition: 'background 250ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {dispatchState === DISPATCH_STATES.PENDING ? <Spinner /> : null}
            {btnLabel}
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: '12px',
      height: '12px',
      border: '2px solid rgba(255,255,255,0.4)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'teamPopupSpin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

const wrapStyle = {
  fontFamily: 'Roboto, sans-serif',
  width: '240px',
  position: 'relative',
};

const closeBtnStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  background: 'none',
  border: 'none',
  fontSize: '15px',
  color: '#6B7280',
  cursor: 'pointer',
  width: '24px',
  height: '24px',
  display: 'grid',
  placeItems: 'center',
  padding: 0,
};

TeamPopup.propTypes = {
  team: PropTypes.object,
  position: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onClose: PropTypes.func.isRequired,
  onDispatched: PropTypes.func,
};
TeamPopup.defaultProps = { team: null, position: null, onDispatched: null };
