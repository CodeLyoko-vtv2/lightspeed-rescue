import PropTypes from 'prop-types';
import micIcon from '../../assets/img/fluent_mic-record-24-regular.svg';
import fireIcon from '../../assets/img/mdi_fire-station.svg';

/* ── Incident badge config ── */
const INCIDENT_META = {
  fire:             { label: 'Hỏa hoạn', icon: fireIcon },
  accident:         { label: 'Tai nạn',  icon: null },
  flood:            { label: 'Đuối nước',icon: null },
  natural_disaster: { label: 'Động đất', icon: null },
  earthquake:       { label: 'Động đất', icon: null },
};

/* Gallery SVG icon inline */
function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="#FF8852" strokeWidth="1.6"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="#FF8852"/>
      <path d="M3 15.5l5.5-5 4 4 3-3 5 5" stroke="#FF8852" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* Inline person/earthquake icon */
function EarthquakeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#7C3AED">
      <circle cx="12" cy="4" r="2"/>
      <path d="M12 7c-1.5 0-3 .7-4 2l-2 3h3l1 4h4l1-4h3l-2-3c-1-1.3-2.5-2-4-2z"/>
      <path d="M9 17l1 4h4l1-4" stroke="#7C3AED" strokeWidth="0.5"/>
    </svg>
  );
}

function AccidentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF8852">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
    </svg>
  );
}

function FloodIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#006FD6">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.5-13H13v6l5.25 3.15-.75 1.23L11.5 14V7z"/>
    </svg>
  );
}

const INCIDENT_ICON_COMPONENT = {
  fire: () => <img src={fireIcon} alt="" style={{ width: '14px', height: '14px' }} />,
  accident: AccidentIcon,
  flood: FloodIcon,
  natural_disaster: EarthquakeIcon,
  earthquake: EarthquakeIcon,
};

export function SosCard({ sos, isSelected, onClick, cardRef, onVoiceRecord, onGallery }) {
  const meta = INCIDENT_META[sos.incidentType];
  const IconComp = INCIDENT_ICON_COMPONENT[sos.incidentType] || null;
  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  const description = sos.description || '';
  const hasAudio = !!sos.hasAudio;
  const hasMedia = !!sos.hasMedia;
  const showButtons = hasAudio || hasMedia;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => onClick(sos)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(sos); }
      }}
      className={`sos-card${isSelected ? ' is-selected' : ''}`}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #F0F2F5',
        fontFamily: 'Roboto, sans-serif',
        cursor: 'pointer',
        transition: 'background 150ms ease',
        borderLeft: isSelected ? '3px solid #FF8852' : '3px solid transparent',
        background: isSelected ? '#FFF8F2' : 'transparent',
      }}
    >
      {/* Row 1: Tên cam + Badge (icon + text, no bg) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={nameStyle}>{sos.victimName || 'Nạn nhân'}</div>
        {meta ? (
          <div style={badgeStyle}>
            {IconComp ? <IconComp /> : null}
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#374151' }}>
              {meta.label}
            </span>
          </div>
        ) : null}
      </div>

      {/* Row 2: Số điện thoại */}
      {phone ? (
        <div style={phoneStyle}>{phone}</div>
      ) : null}

      {/* Row 3: Địa chỉ */}
      <div style={addressStyle}>{address}</div>

      {/* Row 4: Mô tả */}
      {description ? (
        <div style={descStyle}>{description}</div>
      ) : null}

      {/* Row 5: Icon buttons (chỉ hiện khi có audio/media) */}
      {showButtons ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '10px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {hasAudio ? (
            <button
              type="button"
              style={iconBtnStyle}
              onClick={(e) => { e.stopPropagation(); onVoiceRecord?.(sos); }}
            >
              <img src={micIcon} alt="" style={{ width: '22px', height: '22px' }} />
              <span>Ghi âm</span>
            </button>
          ) : null}
          {hasMedia ? (
            <button
              type="button"
              style={iconBtnStyle}
              onClick={(e) => { e.stopPropagation(); onGallery?.(sos); }}
            >
              <GalleryIcon />
              <span>Bộ sưu tập</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ── helpers ── */
function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  return n;
}

function getSosAddress(sos) {
  return sos.address || sos.locationAddress || sos.victimAddress ||
    sos.location?.address || sos.location?.formattedAddress || sos.location?.name || '';
}

/* ── Styles ── */
const nameStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#FF8852',
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const badgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
};

const phoneStyle = {
  fontSize: '13px',
  color: '#374151',
  marginTop: '3px',
  fontWeight: 400,
};

const addressStyle = {
  fontSize: '12px',
  color: '#6B7280',
  marginTop: '2px',
  lineHeight: 1.4,
};

const descStyle = {
  fontSize: '12px',
  color: '#9CA3AF',
  marginTop: '2px',
  lineHeight: 1.4,
};

const iconBtnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  color: '#FF8852',
  fontFamily: 'Roboto, sans-serif',
  padding: '4px 8px',
};

SosCard.propTypes = {
  sos: PropTypes.shape({
    victimName: PropTypes.string,
    incidentType: PropTypes.string,
    victimPhone: PropTypes.string,
    phone: PropTypes.string,
    phoneNumber: PropTypes.string,
    description: PropTypes.string,
    address: PropTypes.string,
    locationAddress: PropTypes.string,
    victimAddress: PropTypes.string,
    location: PropTypes.object,
    status: PropTypes.string,
    hasAudio: PropTypes.bool,
    hasMedia: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onDispatch: PropTypes.func,
  onVoiceRecord: PropTypes.func,
  onGallery: PropTypes.func,
  cardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

SosCard.defaultProps = {
  isSelected: false,
  cardRef: null,
  onDispatch: null,
  onVoiceRecord: null,
  onGallery: null,
};
