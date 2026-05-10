import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import hienTruong3 from '../../assets/img/Hình ảnh hiện trường 3.png';
import hienTruong1 from '../../assets/img/54ddc68eb94f02fcd6a8bf09441ef511e35c96aa.png';

// Mock gallery items — trong production sẽ lấy từ sos.mediaFiles
const MOCK_ITEMS = [
  { id: 1, type: 'image', src: hienTruong1, thumb: hienTruong1 },
  { id: 2, type: 'video', src: hienTruong3, thumb: hienTruong3, duration: '1:12' },
  { id: 3, type: 'image', src: hienTruong3, thumb: hienTruong3 },
  { id: 4, type: 'video', src: hienTruong1, thumb: hienTruong1, duration: '0:48' },
];

function PlayIcon({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 12 14" fill="white">
        <path d="M1 1l10 6L1 13V1z" />
      </svg>
    </div>
  );
}

PlayIcon.propTypes = { size: PropTypes.number };
PlayIcon.defaultProps = { size: 32 };

/* ────────────────────────────────
   LIGHTBOX — fullscreen viewer
──────────────────────────────── */
function Lightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const item = items[current];
  const canPrev = current > 0;
  const canNext = current < items.length - 1;

  const handleKey = (e) => {
    if (e.key === 'ArrowLeft' && canPrev) setCurrent((c) => c - 1);
    if (e.key === 'ArrowRight' && canNext) setCurrent((c) => c + 1);
    if (e.key === 'Escape') onClose();
  };

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      style={lbOverlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={handleKey}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      ref={(el) => el?.focus()}
    >
      {/* Left arrow */}
      {canPrev && (
        <button type="button" style={arrowBtn('left')} onClick={() => setCurrent((c) => c - 1)} aria-label="Ảnh trước">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      )}

      {/* Media */}
      <div style={lbMediaWrap}>
        {item.type === 'video' ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={item.src}
              alt="hiện trường"
              style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '6px', display: 'block' }}
            />
            {/* Video overlay controls */}
            <div style={videoOverlayStyle}>
              <PlayIcon size={56} />
              <div style={videoProgressStyle}>
                <div style={{ flex: 1, height: '3px', background: '#FF0000', borderRadius: '2px', width: '35%' }} />
                <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px', flex: '65%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', fontSize: '11px', color: 'white', marginTop: '2px' }}>
                <span>{item.duration || '0:00'}</span>
                <span style={{ display: 'flex', gap: '8px', opacity: 0.9 }}>
                  ⚙ ⛶
                </span>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={item.src}
            alt="hiện trường"
            style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '6px', display: 'block' }}
          />
        )}
      </div>

      {/* Right arrow */}
      {canNext && (
        <button type="button" style={arrowBtn('right')} onClick={() => setCurrent((c) => c + 1)} aria-label="Ảnh tiếp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      )}

      {/* Counter */}
      <div style={lbCounterStyle}>{current + 1} / {items.length}</div>
    </div>,
    document.body
  );
}

Lightbox.propTypes = {
  items: PropTypes.array.isRequired,
  startIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

/* ────────────────────────────────
   GALLERY MODAL
──────────────────────────────── */
export function GalleryModal({ sos, onClose }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const name = sos?.victimName || 'Nạn nhân';
  const phone = formatPhone(sos?.victimPhone || sos?.phone || sos?.phoneNumber);
  const items = sos?.mediaFiles || MOCK_ITEMS;

  return createPortal(
    <>
      <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={modalStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                Bộ sưu tập hiện trường
              </div>
              <div style={{ fontSize: '13px', color: '#FF8852', marginTop: '3px', fontWeight: 500 }}>
                {name}
                {phone ? <span style={{ color: '#6B7280', fontWeight: 400 }}> • {phone}</span> : null}
              </div>
            </div>
            <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Đóng">
              ✕
            </button>
          </div>

          {/* Grid */}
          <div style={gridStyle}>
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                style={gridItemStyle}
                onClick={() => setLightboxIdx(i)}
                aria-label={`Xem ${item.type === 'video' ? 'video' : 'ảnh'} ${i + 1}`}
              >
                <img
                  src={item.thumb}
                  alt={`hiện trường ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Play button overlay for video */}
                {item.type === 'video' ? (
                  <div style={thumbOverlayStyle}>
                    <PlayIcon size={36} />
                    {item.duration ? (
                      <span style={durationBadgeStyle}>{item.duration}</span>
                    ) : null}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null ? (
        <Lightbox
          items={items}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      ) : null}
    </>,
    document.body
  );
}

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  return n;
}

GalleryModal.propTypes = {
  sos: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
GalleryModal.defaultProps = { sos: null };

/* ── Styles ── */
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 9998,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalStyle = {
  background: '#FFFFFF',
  borderRadius: '16px',
  width: '580px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Roboto, sans-serif',
  boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
  overflow: 'hidden',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '20px 24px 16px',
  borderBottom: '1px solid #F0F2F5',
  flexShrink: 0,
};

const closeBtnStyle = {
  background: 'none', border: 'none',
  fontSize: '18px', color: '#6B7280',
  cursor: 'pointer', width: '32px', height: '32px',
  display: 'grid', placeItems: 'center',
  borderRadius: '50%', padding: 0, flexShrink: 0,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  padding: '16px 24px 24px',
  overflowY: 'auto',
};

const gridItemStyle = {
  position: 'relative',
  aspectRatio: '16 / 10',
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'pointer',
  background: '#F3F4F6',
  border: 'none',
  padding: 0,
  display: 'block',
};

const thumbOverlayStyle = {
  position: 'absolute', inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.15)',
};

const durationBadgeStyle = {
  position: 'absolute',
  bottom: '6px', right: '8px',
  fontSize: '11px', fontWeight: 600,
  color: 'white',
  background: 'rgba(0,0,0,0.65)',
  padding: '1px 5px',
  borderRadius: '3px',
};

/* Lightbox styles */
const lbOverlayStyle = {
  position: 'fixed', inset: 0, zIndex: 10000,
  background: 'rgba(0,0,0,0.88)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  outline: 'none',
};

const lbMediaWrap = {
  maxWidth: '80vw',
  maxHeight: '80vh',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

const arrowBtn = (side) => ({
  position: 'absolute',
  [side]: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '50%',
  width: '44px', height: '44px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 1,
  transition: 'background 150ms ease',
});

const lbCounterStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'white',
  fontSize: '13px',
  background: 'rgba(0,0,0,0.5)',
  padding: '3px 10px',
  borderRadius: '12px',
};

const videoOverlayStyle = {
  position: 'absolute', inset: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const videoProgressStyle = {
  position: 'absolute',
  bottom: '28px', left: '8px', right: '8px',
  display: 'flex',
  gap: '2px',
  alignItems: 'center',
};
