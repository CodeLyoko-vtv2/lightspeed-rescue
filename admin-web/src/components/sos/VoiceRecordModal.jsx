import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

export function VoiceRecordModal({ sos, audioUrl, onClose }) {
  const records = resolveAudioRecords(audioUrl, sos);
  const name = sos?.victimName || 'Nạn nhân';
  const phone = formatPhone(sos?.victimPhone || sos?.phone || sos?.phoneNumber);

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <div style={titleStyle}>Ghi âm hiện trường</div>
            <div style={subTitleStyle}>
              {name}
              {phone ? <span style={phoneStyle}> • {phone}</span> : null}
            </div>
          </div>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Đóng">
            ×
          </button>
        </div>

        {records.length > 0 ? (
          <div style={audioListStyle}>
            {records.map((record, index) => (
              <div key={record.url} style={audioItemStyle}>
                <div style={audioMetaStyle}>
                  <span style={audioNameStyle}>Bản ghi âm {index + 1}</span>
                  {record.time ? <span style={audioTimeStyle}>{formatTime(record.time)}</span> : null}
                </div>
                <audio controls src={record.url} style={audioStyle} />
                <a href={record.url} target="_blank" rel="noreferrer" style={downloadStyle}>
                  Mở ghi âm
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div style={emptyStyle}>Chưa có ghi âm được gửi lên.</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function resolveAudioRecords(explicitUrl, sos) {
  const records = [];

  if (typeof explicitUrl === 'string' && explicitUrl.trim().length > 0) {
    records.push({ url: explicitUrl.trim(), time: null });
  }

  records.push(
    ...normalizeAudioRecords(sos?.audioUrl, sos?.updatedAt || sos?.createdAt),
    ...normalizeAudioRecords(sos?.audioRecordings, sos?.updatedAt || sos?.createdAt),
  );

  if (Array.isArray(sos?.incidentUpdates)) {
    sos.incidentUpdates.forEach((update) => {
      records.push(
        ...normalizeAudioRecords(update?.audioUrl, update?.createdAt),
        ...normalizeAudioRecords(update?.audioRecordings, update?.createdAt),
      );
    });
  }

  const seen = new Set();
  return records.filter((record) => {
    if (!record.url || seen.has(record.url)) return false;
    seen.add(record.url);
    return true;
  });
}

function normalizeAudioRecords(raw, fallbackTime) {
  const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  return list
    .map((item) => {
      if (typeof item === 'string') {
        return { url: item.trim(), time: fallbackTime || null };
      }
      if (item && typeof item === 'object') {
        const rawUrl = item.url || item.src || item.audioUrl || '';
        return {
          url: typeof rawUrl === 'string' ? rawUrl.trim() : '',
          time: item.createdAt || item.timestamp || fallbackTime || null,
        };
      }
      return null;
    })
    .filter((record) => record?.url);
}

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return `(+84) ${n.slice(1)}`;
  return n;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

VoiceRecordModal.propTypes = {
  sos: PropTypes.object,
  audioUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

VoiceRecordModal.defaultProps = {
  sos: null,
  audioUrl: null,
};

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
  padding: '20px 24px 24px',
  width: '460px',
  maxWidth: '90vw',
  maxHeight: '82vh',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  fontFamily: 'Roboto, sans-serif',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '16px',
};

const titleStyle = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#FF8852',
};

const subTitleStyle = {
  marginTop: '4px',
  fontSize: '13px',
  color: '#374151',
};

const phoneStyle = {
  color: '#6B7280',
  fontWeight: 500,
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

const audioListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxHeight: '58vh',
  overflowY: 'auto',
  paddingRight: '4px',
};

const audioItemStyle = {
  padding: '12px',
  border: '1px solid #F3F4F6',
  borderRadius: '12px',
  background: '#FAFAFA',
};

const audioMetaStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '8px',
};

const audioNameStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#374151',
};

const audioTimeStyle = {
  fontSize: '12px',
  color: '#9CA3AF',
  whiteSpace: 'nowrap',
};

const audioStyle = {
  width: '100%',
};

const downloadStyle = {
  display: 'inline-block',
  marginTop: '8px',
  fontSize: '12px',
  color: '#FF8852',
  textDecoration: 'none',
  fontWeight: 600,
};

const emptyStyle = {
  fontSize: '14px',
  color: '#6B7280',
  padding: '16px 0 8px',
};
