import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { VoiceRecordModal } from '../sos/VoiceRecordModal.jsx';
import { GalleryModal } from '../sos/GalleryModal.jsx';
import { IncidentBadge } from '../sos/IncidentMeta.jsx';
import { getIncidentMeta } from '../sos/incidentMeta.js';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

// Marker trong suốt — chỉ để neo popup đúng vị trí
const INVISIBLE_ICON = L.divIcon({
  className: '',
  html: '',
  iconSize: [1, 1],
  iconAnchor: [0, 0],
  popupAnchor: [0, -52], // Điểm neo của popup: dịch lên 52px (đúng bằng chiều cao của SosMarker)
});

export function MapZoomPopup({ sos, position, openKey, onDispatch }) {
  const markerRef = useRef(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 60);
    return () => clearTimeout(timer);
  }, [sos?.id, openKey]);

  if (!sos || !position) return null;

  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  const description = sos.description || '';
  const incidentKey = String(sos.incidentType || '').toUpperCase();
  const incident = getIncidentMeta(incidentKey, sos);
  const audioUrls = getAudioUrls(sos);
  const mediaUrls = getMediaUrls(sos);
  const hasAudio = audioUrls.length > 0;
  const hasMedia = mediaUrls.length > 0;

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
              {incident ? <IncidentBadge incident={incident} compact /> : null}
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

            {(hasAudio || hasMedia) ? (
              <div className="map-zoom-popup__meta">
                {hasAudio ? (
                  <span className="map-zoom-popup__meta-pill">Ghi âm</span>
                ) : null}
                {hasMedia ? (
                  <span className="map-zoom-popup__meta-pill">{mediaUrls.length} ảnh</span>
                ) : null}
              </div>
            ) : null}

            {/* Dòng 5: Icon buttons */}
            {(hasAudio || hasMedia) ? (
              <div className="map-zoom-popup__actions">
                {hasAudio ? (
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
                ) : null}
                {hasMedia ? (
                  <button
                    type="button"
                    className="map-zoom-popup__action-btn"
                    onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
                  >
                    <svg className="map-zoom-popup__action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF8852" strokeWidth="1.5"/>
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="#FF8852" strokeWidth="1.5"/>
                      <path d="M21 15L16.5 10.5C15.6716 9.67157 14.3284 9.67157 13.5 10.5L3 21" stroke="#FF8852" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="map-zoom-popup__action-text">Bộ sưu tập</span>
                  </button>
                ) : null}
              </div>
            ) : null}

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
        <VoiceRecordModal
          sos={sos}
          onClose={() => setShowVoiceModal(false)}
        />
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

function getSosAddress(sos) {
  return sos.address || sos.locationAddress || sos.victimAddress ||
    sos.location?.address || sos.location?.formattedAddress ||
    sos.location?.name || 'Chưa có địa chỉ';
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

MapZoomPopup.propTypes = {
  sos: PropTypes.object,
  position: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  openKey: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onDispatch: PropTypes.func.isRequired,
};

MapZoomPopup.defaultProps = { sos: null, position: null, openKey: 0 };
