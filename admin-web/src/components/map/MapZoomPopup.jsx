import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { VoiceRecordModal } from '../sos/VoiceRecordModal.jsx';
import { GalleryModal } from '../sos/GalleryModal.jsx';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import closeIcon from '../../assets/img/icon-close.svg';
import micIcon from '../../assets/img/fluent_mic-record-24-regular.svg';
import pinIcon from '../../assets/img/icon-pin.svg';
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

export function MapZoomPopup({ sos, position, onClose, onDispatch }) {
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
          <div style={wrapStyle}>
            {/* Dòng 1: Tên cam + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#FF8852' }}>
                {sos.victimName || 'Nạn nhân'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFD6D6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#000000">
                    <path d="M12 2C12 2 16 6 16 11C16 15.4183 14.2091 19 12 19C9.79086 19 8 15.4183 8 11C8 6 12 2 12 2Z" />
                    <path d="M12 11C12 11 14 13 14 15C14 16.6569 13.1046 18 12 18C10.8954 18 10 16.6569 10 15C10 13 12 11 12 11Z" fill="#FFD6D6" />
                  </svg>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>
                  {incident.label}
                </span>
              </div>
            </div>

            {/* Dòng 2: Số điện thoại */}
            {phone
              ? <div style={{ fontSize: '13px', fontWeight: 700, color: '#000000', marginTop: '10px' }}>{phone}</div>
              : null}

            {/* Dòng 3: Địa chỉ */}
            <div style={{ fontSize: '14px', color: '#000000', marginTop: '10px', lineHeight: 1.4 }}>
              {address}
            </div>

            {/* Dòng 4: Mô tả */}
            {description
              ? <div style={{ fontSize: '14px', color: '#555555', marginTop: '10px' }}>{description}</div>
              : null}

            {/* Dòng 5: Icon buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
              <button
                type="button"
                style={iconBtnStyle}
                onClick={(e) => { e.stopPropagation(); setShowVoiceModal(true); }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C10.8954 2 10 2.89543 10 4V11C10 12.1046 10.8954 13 12 13C13.1046 13 14 12.1046 14 11V4C14 2.89543 13.1046 2 12 2Z" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17 11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="16" cy="18" r="3" stroke="#FF8852" strokeWidth="1.5"/>
                  <circle cx="16" cy="18" r="1" fill="#FF8852"/>
                </svg>
                <span>Ghi âm</span>
              </button>
              <button type="button" style={iconBtnStyle}
                onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF8852" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#FF8852" strokeWidth="1.5"/>
                  <path d="M21 15L16.5 10.5C15.6716 9.67157 14.3284 9.67157 13.5 10.5L3 21" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Bộ sưu tập</span>
              </button>
            </div>

            {/* Nút Triển khai */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDispatch(sos); }}
              style={dispatchBtnStyle}
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

/* ── Styles ── */
const wrapStyle = {
  fontFamily: 'Roboto, sans-serif',
  width: '260px',
  position: 'relative',
  padding: '6px 4px',
};

const iconBtnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#FF8852',
  fontFamily: 'Roboto, sans-serif',
  padding: '4px',
};

const dispatchBtnStyle = {
  width: '100%',
  marginTop: '20px',
  background: '#F4804E',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  return n;
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
