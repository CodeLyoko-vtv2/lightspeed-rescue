import PropTypes from 'prop-types';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

const TEAM_COLOR = {
  'Công an':   '#1A8C2C',
  'Cứu hỏa':  '#D43F00',
  'Quân đội':  '#1A6B8C',
  'Bệnh viện': '#7C1AD4',
};

function escapeHtml(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  if (n.startsWith('023')) return `(+84) ${n.slice(1)}`;
  return n;
}

export function TeamMarker({ team, location, activeFilter, onClick, dispatchMode }) {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return null;
  }

  // Ẩn marker nếu không khớp filter (áp dụng cả trong và ngoài dispatchMode)
  if (activeFilter && activeFilter !== team.type) {
    return null;
  }

  // Ngoài dispatchMode và không có filter → ẩn hết team markers
  if (!dispatchMode && !activeFilter) {
    return null;
  }

  const bg = TEAM_COLOR[team.type] || '#1A8C2C';
  const phone = formatPhone(team.phone || '');
  const shortAddr = (team.address || '').split(',').slice(0, 2).join(',');
  const shortName = (team.name || 'Đội cứu hộ').length > 22
    ? (team.name || '').slice(0, 22) + '...'
    : (team.name || 'Đội cứu hộ');

  const markerIcon = L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        background: ${bg};
        border-radius: 8px;
        padding: 6px 10px;
        min-width: 160px;
        max-width: 210px;
        color: #ffffff;
        font-family: Roboto, sans-serif;
        font-size: 11px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        white-space: nowrap;
        cursor: pointer;
      ">
        <div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(shortName)}${phone ? ` <span style="font-weight:400;opacity:0.85;">${escapeHtml(phone)}</span>` : ''}</div>
        <div style="display:flex;align-items:center;gap:3px;margin-top:2px;opacity:0.9;">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="white" style="flex-shrink:0">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
          </svg>
          <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtml(shortAddr)}</span>
        </div>
        <div style="
          position: absolute;
          bottom: -7px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid ${bg};
        "></div>
      </div>
    `,
    iconSize: [210, 52],
    iconAnchor: [105, 52],
  });

  return (
    <Marker
      position={location}
      icon={markerIcon}
      eventHandlers={{
        click: () => onClick?.(team),
      }}
    />
  );
}

TeamMarker.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  location: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  activeFilter: PropTypes.string,
  onClick: PropTypes.func,
  dispatchMode: PropTypes.bool,
};

TeamMarker.defaultProps = {
  location: null,
  activeFilter: null,
  onClick: null,
  dispatchMode: false,
};
