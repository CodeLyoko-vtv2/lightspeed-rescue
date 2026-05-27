import PropTypes from 'prop-types';
import micIcon from '../../assets/img/fluent_mic-record-24-regular.svg';
import { IncidentBadge } from './IncidentMeta.jsx';
import { getIncidentMeta } from './incidentMeta.js';

export function SosCard({ sos, isSelected, onClick, cardRef, onVoiceRecord, onGallery }) {
  const incidentKey = String(sos.incidentType || '').toUpperCase();
  const incident = getIncidentMeta(incidentKey, sos);
  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  const description = sos.description || '';
  const audioUrls = getAudioUrls(sos);
  const mediaUrls = getMediaUrls(sos);
  const hasAudio = Boolean(sos.hasAudio || audioUrls.length > 0 || sos.audioRecordings?.length);
  const hasMedia = Boolean(sos.hasMedia || mediaUrls.length > 0 || sos.mediaImages?.length);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => onClick(sos)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(sos);
        }
      }}
      className={`sos-card${isSelected ? ' is-selected' : ''}`}
      style={{
        position: 'relative',
        padding: '18px 28px 18px 20px',
        borderBottom: '1px solid #E5F3EA',
        fontFamily: 'Roboto, Arial, sans-serif',
        cursor: 'pointer',
        background: isSelected ? '#FFF7F2' : '#FFFFFF',
        borderLeft: isSelected ? '3px solid #FF8852' : '3px solid transparent',
        minHeight: '142px',
      }}
    >
      {incident ? (
        <div style={incidentStyle}>
          <IncidentBadge incident={incident} compact />
        </div>
      ) : null}

      <div style={nameStyle}>{sos.victimName || 'Nạn nhân'}</div>
      {phone ? <div style={phoneStyle}>{phone}</div> : null}
      {address ? <div style={addressStyle}>{address}</div> : null}
      {description ? <div style={descStyle}>{description}</div> : null}

      {(hasAudio || hasMedia) ? (
        <div
          style={actionsStyle}
          onClick={(event) => event.stopPropagation()}
        >
          {hasAudio ? (
            <button
              type="button"
              style={iconBtnStyle}
              onClick={(event) => {
                event.stopPropagation();
                onVoiceRecord?.(sos);
              }}
            >
              <img src={micIcon} alt="" style={{ width: '24px', height: '24px' }} />
              <span>Ghi âm</span>
            </button>
          ) : null}
          {hasMedia ? (
            <button
              type="button"
              style={iconBtnStyle}
              onClick={(event) => {
                event.stopPropagation();
                onGallery?.(sos);
              }}
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

function GalleryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="#FF6B3A" strokeWidth="1.6" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="#FF6B3A" />
      <path d="M3 15.5l5.5-5 4 4 3-3 5 5" stroke="#FF6B3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatPhone(phone) {
  if (!phone) return '';
  const normalized = String(phone).trim();
  if (normalized.startsWith('+')) return normalized;
  if (normalized.startsWith('0')) return `(+84) ${normalized.slice(1)}`;
  return normalized;
}

function getSosAddress(sos) {
  return (
    sos.address ||
    sos.locationAddress ||
    sos.victimAddress ||
    sos.location?.address ||
    sos.location?.formattedAddress ||
    sos.location?.name ||
    ''
  );
}

function getAudioUrls(sos) {
  const topLevel = normalizeAudioUrls(sos?.audioUrl || sos?.audioRecordings);
  const fromUpdates = Array.isArray(sos?.incidentUpdates)
    ? sos.incidentUpdates.flatMap((update) => normalizeAudioUrls(update?.audioUrl || update?.audioRecordings))
    : [];
  return uniqueStrings([...topLevel, ...fromUpdates]);
}

function normalizeAudioUrls(raw) {
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof raw === 'string' && raw.trim().length > 0) return [raw];
  return [];
}

function getMediaUrls(sos) {
  const topLevel = normalizeMediaUrls(sos?.mediaUrl || sos?.mediaImages || sos?.mediaFiles);
  const fromUpdates = Array.isArray(sos?.incidentUpdates)
    ? sos.incidentUpdates.flatMap((update) => normalizeMediaUrls(update?.mediaUrl || update?.mediaImages || update?.mediaFiles))
    : [];
  return uniqueStrings([...topLevel, ...fromUpdates]);
}

function normalizeMediaUrls(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.src || item.url || item.thumb || '';
        return '';
      })
      .filter((value) => typeof value === 'string' && value.trim().length > 0);
  }
  if (typeof raw === 'string' && raw.trim().length > 0) return [raw];
  return [];
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter((value) => typeof value === 'string' && value.trim())));
}

const nameStyle = {
  maxWidth: '210px',
  fontSize: '16px',
  fontWeight: 800,
  color: '#FF6B3A',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  marginBottom: '8px',
};

const phoneStyle = {
  fontSize: '13px',
  color: '#111111',
  fontWeight: 800,
  marginBottom: '8px',
};

const addressStyle = {
  fontSize: '13px',
  color: '#111111',
  lineHeight: 1.35,
  marginBottom: '8px',
};

const descStyle = {
  fontSize: '13px',
  color: '#555555',
  lineHeight: 1.35,
};

const incidentStyle = {
  position: 'absolute',
  top: '18px',
  right: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const actionsStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '44px',
  paddingTop: '18px',
};

const iconBtnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#FF6B3A',
  fontFamily: 'Roboto, Arial, sans-serif',
  padding: 0,
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
    audioUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    mediaUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    audioRecordings: PropTypes.array,
    mediaImages: PropTypes.array,
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
