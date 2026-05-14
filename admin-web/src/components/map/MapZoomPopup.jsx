import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { VoiceRecordModal } from '../sos/VoiceRecordModal.jsx';
import { GalleryModal } from '../sos/GalleryModal.jsx';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import fireIcon from '../../assets/img/mdi_fire-station.svg';

// Marker trong suốt — chỉ để neo popup đúng vị trí
const INVISIBLE_ICON = L.divIcon({
  className: '',
  html: '',
  iconSize: [1, 1],
  iconAnchor: [0, 0],
  popupAnchor: [0, -52], // Điểm neo của popup: dịch lên 52px (đúng bằng chiều cao của SosMarker)
});

const INCIDENT_META = {
  fire:             { label: 'Hỏa hoạn', color: '#FF3A52', icon: fireIcon },
  accident:         { label: 'Tai nạn',  color: '#FF8852', icon: null },
  flood:            { label: 'Đuối nước',color: '#006FD6', icon: null },
  natural_disaster: { label: 'Động đất', color: '#7C3AED', icon: null },
  earthquake:       { label: 'Động đất', color: '#7C3AED', icon: null },
};

export function MapZoomPopup({ sos, position, onDispatch }) {
  const markerRef = useRef(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 60);
    return () => clearTimeout(timer);
  }, [sos?.id]);

  if (!sos || !position) return null;

  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  const description = sos.description || '';
  const incident = INCIDENT_META[sos.incidentType] || { label: 'Khác', color: '#6B7280', icon: null };
  const badgeBg = blendWithWhite(incident.color, 0.18);
  const badgeTextColor = '#2b2b2b';

  return (
    <>
      <Marker
        ref={markerRef}
        position={position}
        icon={INVISIBLE_ICON}
        zIndexOffset={1000}
      >
        {/* offset âm → popup nằm TRÊN marker đỏ (65px để tránh đè marker) */}
        <Popup
          className="map-zoom-popup"
          closeButton={false}
          autoPan={false}
          offset={[0, -65]}
        >
          <div className="map-zoom-popup__wrap">
            {/* Dòng 1: Tên cam + Badge */}
            <div className="map-zoom-popup__header">
              <span className="map-zoom-popup__name">
                {sos.victimName || 'Nạn nhân'}
              </span>
              <div
                className="map-zoom-popup__badge"
                style={{ background: badgeBg }}
              >
                <div className="map-zoom-popup__badge-icon" style={{ background: badgeBg }}>
                  {incident.icon ? (
                    <img
                      className="map-zoom-popup__badge-image"
                      src={incident.icon}
                      alt=""
                    />
                  ) : (
                    <svg className="map-zoom-popup__badge-svg" viewBox="0 0 24 24" fill="#2b2b2b">
                      <path d="M12 2C12 2 16 6 16 11C16 15.4183 14.2091 19 12 19C9.79086 19 8 15.4183 8 11C8 6 12 2 12 2Z" />
                      <path d="M12 11C12 11 14 13 14 15C14 16.6569 13.1046 18 12 18C10.8954 18 10 16.6569 10 15C10 13 12 11 12 11Z" />
                    </svg>
                  )}
                </div>
                <span className="map-zoom-popup__badge-text" style={{ color: badgeTextColor }}>
                  {incident.label}
                </span>
              </div>
            </div>

            {/* Dòng 2: Số điện thoại */}
            {phone
              ? <div className="map-zoom-popup__phone">{phone}</div>
              : null}

            {/* Dòng 3: Địa chỉ */}
            <div className="map-zoom-popup__address">
              {address}
            </div>

            {/* Dòng 4: Mô tả */}
            {description
              ? <div className="map-zoom-popup__desc">{description}</div>
              : null}

            {/* Dòng 5: Icon buttons */}
            <div className="map-zoom-popup__actions">
              <button
                type="button"
                className="map-zoom-popup__action-btn"
                onClick={(e) => { e.stopPropagation(); setShowVoiceModal(true); }}
              >
                <svg className="map-zoom-popup__action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C10.8954 2 10 2.89543 10 4V11C10 12.1046 10.8954 13 12 13C13.1046 13 14 12.1046 14 11V4C14 2.89543 13.1046 2 12 2Z" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17 11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="16" cy="18" r="3" stroke="#FF8852" strokeWidth="1.5"/>
                  <circle cx="16" cy="18" r="1" fill="#FF8852"/>
                </svg>
                <span className="map-zoom-popup__action-text">Ghi âm</span>
              </button>
              <button type="button" className="map-zoom-popup__action-btn"
                onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
              >
                <svg className="map-zoom-popup__action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF8852" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#FF8852" strokeWidth="1.5"/>
                  <path d="M21 15L16.5 10.5C15.6716 9.67157 14.3284 9.67157 13.5 10.5L3 21" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="map-zoom-popup__action-text">Bộ sưu tập</span>
              </button>
            </div>

            {/* Nút Triển khai */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDispatch(sos); }}
              className="map-zoom-popup__dispatch-btn"
            >
              Triển khai cứu hộ
            </button>
          </div>
        </Popup>
      </Marker>

      {/* VoiceRecordModal render ra ngoài map qua portal */}
      {showVoiceModal ? (
        <VoiceRecordModal onClose={() => setShowVoiceModal(false)} />
      ) : null}

      {/* GalleryModal render ra ngoài map qua portal */}
      {showGalleryModal ? (
        <GalleryModal sos={sos} onClose={() => setShowGalleryModal(false)} />
      ) : null}
    </>
  );
}

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  return n;
}

function blendWithWhite(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r * alpha + 255 * (1 - alpha));
  const g = Math.round(rgb.g * alpha + 255 * (1 - alpha));
  const b = Math.round(rgb.b * alpha + 255 * (1 - alpha));
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  const normalized = String(hex || '').replace('#', '').trim();
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function getSosAddress(sos) {
  return sos.address || sos.locationAddress || sos.victimAddress ||
    sos.location?.address || sos.location?.formattedAddress ||
    sos.location?.name || 'Chưa có địa chỉ';
}

MapZoomPopup.propTypes = {
  sos: PropTypes.object,
  position: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onClose: PropTypes.func.isRequired,
  onDispatch: PropTypes.func.isRequired,
};

MapZoomPopup.defaultProps = { sos: null, position: null };
