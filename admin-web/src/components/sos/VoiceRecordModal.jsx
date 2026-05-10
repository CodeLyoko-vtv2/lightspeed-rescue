import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

// Chiều cao các bar waveform (giả lập dạng sóng âm thanh tự nhiên)
const BAR_HEIGHTS = [
  4, 10, 18, 28, 38, 46, 52, 44, 50, 58,
  50, 44, 52, 60, 54, 46, 40, 48, 56, 50,
  42, 34, 42, 50, 44, 36, 26, 18, 12, 8,
  5, 10, 16, 8, 4,
];
const TOTAL_BARS = BAR_HEIGHTS.length;
const DOTS_COUNT = 18;

export function VoiceRecordModal({ onClose }) {
  const [isRecording, setIsRecording] = useState(true);
  const [elapsed, setElapsed] = useState(604); // 10:04 như trong ảnh
  const [cursorPos, setCursorPos] = useState(20); // bar index hiện tại
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
        setCursorPos((p) => Math.min(p + 0.15, TOTAL_BARS - 1));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleReplay = () => {
    setElapsed(0);
    setCursorPos(0);
    setIsRecording(true);
  };

  const activeBars = Math.floor(cursorPos);

  return createPortal(
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <span style={titleStyle}>
            {isRecording ? 'Ghi âm' : 'Ghi âm: tạm dừng'}
          </span>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Waveform */}
        <div style={waveContainerStyle}>
          <div style={waveInnerStyle}>
            {/* Bars đã ghi (cam) */}
            {BAR_HEIGHTS.slice(0, activeBars).map((h, i) => (
              <div
                key={`bar-${i}`}
                style={{
                  width: '3px',
                  height: `${h}px`,
                  background: '#FF8852',
                  borderRadius: '2px',
                  flexShrink: 0,
                  animation: isRecording && i >= activeBars - 3
                    ? 'voiceBarPulse 0.4s ease-in-out infinite alternate'
                    : 'none',
                }}
              />
            ))}

            {/* Cursor line */}
            <div style={cursorStyle} />

            {/* Dots phần chưa ghi */}
            {Array.from({ length: DOTS_COUNT }).map((_, i) => (
              <div
                key={`dot-${i}`}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#CCCCCC',
                  flexShrink: 0,
                  alignSelf: 'center',
                  marginLeft: i === 0 ? '0' : '3px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer + buttons */}
        <div style={bottomRowStyle}>
          <span style={timerStyle}>{formatTime(elapsed)}</span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Pause / Play */}
            <button
              type="button"
              onClick={() => setIsRecording((v) => !v)}
              style={secBtnStyle}
            >
              {isRecording ? (
                <>
                  <PauseIcon />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon />
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Replay */}
            <button type="button" onClick={handleReplay} style={primaryBtnStyle}>
              <ReplayIcon />
              <span>Replay</span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS animation keyframes inline */}
      <style>{`
        @keyframes voiceBarPulse {
          from { transform: scaleY(1); }
          to   { transform: scaleY(1.4); }
        }
      `}</style>
    </div>,
    document.body
  );
}

/* ── Icon components ── */
function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
      <rect x="0" y="0" width="3" height="12" rx="1" />
      <rect x="7" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
      <path d="M0 0l10 6-10 6V0z" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  );
}

/* ── Styles ── */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(2px)',
};

const cardStyle = {
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '20px 24px',
  width: '360px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  fontFamily: 'Roboto, sans-serif',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const titleStyle = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#FF8852',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  color: '#6B7280',
  cursor: 'pointer',
  width: '28px',
  height: '28px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  padding: 0,
};

const waveContainerStyle = {
  background: '#EEF0F8',
  borderRadius: '999px',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  height: '80px',
};

const waveInnerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2.5px',
  width: '100%',
  height: '100%',
};

const cursorStyle = {
  width: '2px',
  height: '56px',
  background: '#FF8852',
  borderRadius: '1px',
  flexShrink: 0,
  marginLeft: '1px',
  marginRight: '2px',
};

const bottomRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '16px',
};

const timerStyle = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#111827',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '1px',
};

const basePillBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
  border: '1px solid #D1D5DB',
};

const secBtnStyle = {
  ...basePillBtn,
  background: '#F3F4F6',
  color: '#374151',
  border: '1px solid #D1D5DB',
};

const primaryBtnStyle = {
  ...basePillBtn,
  background: '#FF8852',
  color: '#FFFFFF',
  border: 'none',
};

VoiceRecordModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
