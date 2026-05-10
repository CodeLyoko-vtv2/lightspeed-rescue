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
        {/* offset âm → popup nằm TRÊN marker đỏ (60px) */}
        <Popup
          className="map-zoom-popup"
          closeButton={false}
          autoPan={false}
          offset={[0, -60]}
        >
          <div style={wrapStyle}>
            {/* Nút đóng X */}
            <button
              type="button"
              aria-label="Đóng"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={closeBtnStyle}
            >
              <img src={closeIcon} alt="" style={{ width: '10px', height: '10px' }} />
            </button>

            {/* Dòng 1: Tên cam + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '26px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#FF8852' }}>
                {sos.victimName || 'Nạn nhân'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {incident.icon
                  ? <img src={incident.icon} alt="" style={{ width: '14px', height: '14px' }} />
                  : <span style={{ fontSize: '12px' }}>⚠️</span>}
                <span style={{ fontSize: '11px', fontWeight: 600, color: incident.color }}>
                  {incident.label}
                </span>
              </div>
            </div>

            {/* Dòng 2: Số điện thoại */}
            {phone
              ? <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginTop: '5px' }}>{phone}</div>
              : null}

            {/* Dòng 3: Địa chỉ */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginTop: '6px' }}>
              <img src={pinIcon} alt="" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>{address}</span>
            </div>

            {/* Dòng 4: Mô tả */}
            {description
              ? <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', fontStyle: 'italic' }}>{description}</div>
              : null}

            {/* Dòng 5: Icon buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid #F0F2F5', paddingTop: '10px' }}>
              <button
                type="button"
                style={iconBtnStyle}
                onClick={(e) => { e.stopPropagation(); setShowVoiceModal(true); }}
              >
                <img src={micIcon} alt="" style={{ width: '22px', height: '22px' }} />
                <span>Ghi âm</span>
              </button>
              <button type="button" style={iconBtnStyle}
                onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="#FF8852" strokeWidth="1.6"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#FF8852"/>
                  <path d="M3 15.5l5.5-5 4 4 3-3 5 5" stroke="#FF8852" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
  width: '235px',
  position: 'relative',
};

const closeBtnStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '22px',
  height: '22px',
  border: 'none',
  borderRadius: '50%',
  background: '#F1F3F4',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  padding: 0,
};

const iconBtnStyle = {
  flex: 1,
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
  padding: '2px 4px',
};

const dispatchBtnStyle = {
  width: '100%',
  marginTop: '10px',
  background: '#FF8852',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 600,
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
