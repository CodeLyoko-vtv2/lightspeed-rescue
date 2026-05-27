import { useState } from 'react';
import PropTypes from 'prop-types';
import { getIncidentMeta } from './incidentMeta.js';

function AlertIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2 1.5 20.5h21L12 2Zm0 4.2 7 12.3H5L12 6.2ZM11 10h2v5h-2v-5Zm0 6.5h2v2h-2v-2Z" />
    </svg>
  );
}

function SosIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2 1.5 20.5h21L12 2Zm-1 7h2v6h-2V9Zm0 7.5h2v2h-2v-2Z" />
    </svg>
  );
}

export function SosAlertToast({ sos, variant, style, onViewOnMap, onDismiss }) {
  const [hidden, setHidden] = useState(false);
  const [minimized, setMinimized] = useState(false);

  if (hidden) return null;

  const isUpdate = variant === 'update';
  const theme = getToastTheme(variant);
  const description = isUpdate ? getUpdateDescription(sos) : getDescription(sos);
  const shortDescription = description.length > 92
    ? `${description.slice(0, 92)}...`
    : description;

  return (
    <div style={{ ...toastStyle, ...style }}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>
          <AlertIcon color={theme.accent} />
          <span>{isUpdate ? 'Cập nhật hiện trường' : 'Cảnh báo Khẩn cấp'}</span>
        </div>
        <div style={headerActionsStyle}>
          <button type="button" aria-label="Thu nhỏ" onClick={() => setMinimized((value) => !value)} style={iconButtonStyle}>
            ...
          </button>
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => {
              setHidden(true);
              onDismiss?.();
            }}
            style={iconButtonStyle}
          >
            ×
          </button>
        </div>
      </div>

      {!minimized ? (
        <>
          <div style={bodyStyle}>
            <div style={alertIconWrapStyle(theme.softAccent)}>
              <SosIcon color={theme.accent} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ ...sosTitleStyle, color: theme.accent }}>
                {isUpdate ? 'Thông tin mới từ nạn nhân' : 'Tín hiệu khẩn cấp (SOS)'}
              </div>
              <div style={descStyle}>{shortDescription}</div>
              <div style={{ ...timeStyle, color: theme.accent }}>
                {formatRelativeTime(sos.createdAt)} <span style={{ ...dotStyle, color: theme.accent }}>•</span>{' '}
                <span style={{ ...urgentStyle, color: theme.accent }}>
                  {isUpdate ? 'Đã bổ sung dữ liệu' : 'Cần hỗ trợ ngay'}
                </span>
              </div>
            </div>
          </div>

          <div style={footerStyle}>
            <button
              type="button"
              onClick={() => {
                setHidden(true);
                onDismiss?.();
              }}
              style={secondaryButtonStyle}
            >
              Tạm ẩn
            </button>
            <button
              type="button"
              onClick={() => {
                onViewOnMap(sos);
                setHidden(true);
              }}
              style={primaryButtonStyle}
            >
              Xem trên bản đồ
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function getDescription(sos) {
  const name = sos.victimName || 'Nạn nhân';
  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  return `${name}${phone ? ` ${phone}` : ''}, đang phát tín hiệu cầu cứu${address ? `, ${address}` : ''}`;
}

function getUpdateDescription(sos) {
  const name = sos.victimName || 'Nạn nhân';
  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  const incident = getIncidentMeta(sos.incidentType, sos);
  const mediaCount = getMediaUrls(sos).length;
  const hasAudio = getAudioUrls(sos).length > 0;
  const detailParts = [];
  if (incident) detailParts.push(incident.label);
  if (sos.description) detailParts.push('Mô tả');
  if (mediaCount > 0) detailParts.push(`${mediaCount} ảnh`);
  if (hasAudio) detailParts.push('Ghi âm');
  const detailText = detailParts.length > 0
    ? `Cập nhật: ${detailParts.join(', ')}`
    : 'Vừa gửi thêm thông tin hiện trường.';
  const addressText = address ? ` • ${address}` : '';
  return `${name}${phone ? ` ${phone}` : ''} vừa cập nhật. ${detailText}${addressText}`;
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

function formatPhone(phone) {
  if (!phone) return '';
  const normalized = String(phone).trim();
  if (normalized.startsWith('+')) return normalized;
  if (normalized.startsWith('0')) return `(+84) ${normalized.slice(1)}`;
  return normalized;
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

function getToastTheme(variant) {
  if (variant === 'update') {
    return { accent: '#FF8852', softAccent: '#FFF3E8' };
  }
  return { accent: '#E3212D', softAccent: '#FEE2E2' };
}

function formatRelativeTime() {
  return 'Vừa xong';
}

const toastStyle = {
  position: 'absolute',
  bottom: '24px',
  left: '16px',
  zIndex: 1000,
  width: '360px',
  background: '#FFFFFF',
  borderRadius: '10px',
  boxShadow: '0 4px 18px rgba(15, 23, 42, 0.22)',
  fontFamily: 'Roboto, Arial, sans-serif',
  overflow: 'hidden',
  border: '1px solid #E5E7EB',
};

const headerStyle = {
  minHeight: '38px',
  padding: '8px 14px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #F1F3F5',
};

const headerTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#4B5563',
  fontSize: '13px',
  fontWeight: 500,
};

const headerActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const iconButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#6B7280',
  width: '24px',
  height: '24px',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  fontSize: '18px',
  lineHeight: 1,
  padding: 0,
};

const bodyStyle = {
  display: 'flex',
  gap: '12px',
  padding: '16px 18px 10px',
};

const alertIconWrapStyle = (background) => ({
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const sosTitleStyle = {
  color: '#E3212D',
  fontSize: '14px',
  fontWeight: 700,
  marginBottom: '4px',
};

const descStyle = {
  color: '#111827',
  fontSize: '14px',
  lineHeight: 1.35,
};

const timeStyle = {
  color: '#E3212D',
  fontSize: '12px',
  fontWeight: 500,
  marginTop: '8px',
};

const dotStyle = {
  color: '#E3212D',
};

const urgentStyle = {
  color: '#E3212D',
};

SosAlertToast.propTypes = {
  sos: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['alert', 'update']),
  style: PropTypes.object,
  onViewOnMap: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
};

SosAlertToast.defaultProps = {
  variant: 'alert',
  style: null,
  onDismiss: null,
};

const footerStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  padding: '8px 18px 16px',
};

const secondaryButtonStyle = {
  height: '36px',
  borderRadius: '5px',
  border: 'none',
  background: '#F1F3F5',
  color: '#374151',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const primaryButtonStyle = {
  height: '36px',
  borderRadius: '5px',
  border: 'none',
  background: '#1A73E8',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};
