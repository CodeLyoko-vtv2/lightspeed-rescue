import PropTypes from 'prop-types';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

const SOS_COLOR_DEFAULT = '#E3212D';
const SOS_COLOR_SELECTED = '#C91824';

export function SosMarker({ sos, isSelected, onClick }) {
  const position = getSosPosition(sos);

  if (!position) {
    return null;
  }

  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const shortAddress = getShortAddress(getSosAddress(sos));
  const bg = isSelected ? SOS_COLOR_SELECTED : SOS_COLOR_DEFAULT;
  const border = isSelected ? '2px solid #ffffff' : 'none';

  const markerIcon = L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: 140px;
        background: ${bg};
        border: ${border};
        border-radius: 4px;
        padding: 7px 8px 8px;
        color: #ffffff;
        font-family: Roboto, Arial, sans-serif;
        font-size: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.28);
      ">
        <div style="display:flex;align-items:center;gap:3px;font-weight:700;overflow:hidden;white-space:nowrap;">
          <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtml(sos.victimName || 'Nạn nhân')}</span>
          ${phone ? `<span style="opacity:0.95;font-weight:500;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(phone)}</span>` : ''}
        </div>
        ${shortAddress ? `
        <div style="display:flex;align-items:center;gap:4px;margin-top:5px;opacity:0.96;overflow:hidden;white-space:nowrap;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style="flex-shrink:0">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
          </svg>
          <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtml(shortAddress)}</span>
        </div>` : ''}
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 9px solid ${bg};
        "></div>
      </div>
    `,
    iconSize: [140, 54],
    iconAnchor: [70, 54],
  });

  return (
    <Marker
      position={position}
      icon={markerIcon}
      eventHandlers={{
        click: () => onClick(sos),
      }}
    />
  );
}

function getSosPosition(sos) {
  if (sos?.location?.lat && sos?.location?.lng) {
    return { lat: sos.location.lat, lng: sos.location.lng };
  }
  if (sos?.location?.latitude && sos?.location?.longitude) {
    return { lat: sos.location.latitude, lng: sos.location.longitude };
  }
  if (sos?.victimLocation?.lat && sos?.victimLocation?.lng) {
    return { lat: sos.victimLocation.lat, lng: sos.victimLocation.lng };
  }
  if (sos?.victimLocation?.latitude && sos?.victimLocation?.longitude) {
    return { lat: sos.victimLocation.latitude, lng: sos.victimLocation.longitude };
  }
  return null;
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

function getShortAddress(address) {
  if (!address) return '';
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.slice(0, 2).join(', ');
}

function formatPhone(phone) {
  if (!phone) return '';
  const normalized = String(phone).trim();
  if (normalized.startsWith('+')) return normalized;
  if (normalized.startsWith('0')) return `(+84) ${normalized.slice(1)}`;
  return normalized;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

SosMarker.propTypes = {
  sos: PropTypes.shape({
    victimName: PropTypes.string,
    incidentType: PropTypes.string,
    location: PropTypes.object,
    victimLocation: PropTypes.object,
    victimPhone: PropTypes.string,
    phone: PropTypes.string,
    phoneNumber: PropTypes.string,
    address: PropTypes.string,
    locationAddress: PropTypes.string,
    victimAddress: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

SosMarker.defaultProps = {
  isSelected: false,
};
