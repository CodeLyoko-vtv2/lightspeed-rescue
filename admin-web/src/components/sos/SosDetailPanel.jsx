import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { GalleryModal } from './GalleryModal.jsx';
import { VoiceRecordModal } from './VoiceRecordModal.jsx';
import { IncidentBadge } from './IncidentMeta.jsx';
import { getIncidentMeta } from './incidentMeta.js';

export function SosDetailPanel({ sos, onClose }) {
  const [showGallery, setShowGallery] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const detailUpdates = useMemo(() => getIncidentUpdates(sos), [sos]);
  const timelineUpdates = useMemo(() => buildTimeline(sos), [sos]);

  if (!sos) return null;

  const name = sos.victimName || 'Nạn nhân';
  const phone = formatPhone(sos.victimPhone || sos.phone || sos.phoneNumber);
  const address = getSosAddress(sos);
  const incident = getIncidentMeta(sos.incidentType, sos);
  const description = sos.description || '';
  const mediaUrls = getMediaUrls(sos);
  const audioUrls = getAudioUrls(sos);

  return (
    <>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div>
            <div style={titleStyle}>Chi tiết nạn nhân</div>
          </div>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Đóng">
            ×
          </button>
        </div>

        <div style={contentStyle}>
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Thông tin cá nhân</div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Tên:</span>
              <span>{name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Điện thoại:</span>
              <span>{phone}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Địa chỉ:</span>
              <span>{address}</span>
            </div>
          </div>

          {incident || description ? (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Tóm tắt mới nhất</div>
              {incident ? (
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Loại sự cố:</span>
                  <IncidentBadge incident={incident} />
                </div>
              ) : null}
              {description ? (
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Mô tả:</span>
                  <span style={descriptionStyle}>{description}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {detailUpdates.length > 0 ? (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Các lần nạn nhân bổ sung</div>
              <div style={updateListStyle}>
                {detailUpdates.map((update, index) => {
                  const updateIncident = getIncidentMeta(update.incidentType, {
                    detailsSubmitted: true,
                  });
                  const updateImages = getUpdateMediaUrls(update);
                  const updateAudio = getUpdateAudioUrls(update);
                  const updateDescription = getCleanText(update.description);

                  return (
                    <div key={`${getUpdateTimeKey(update.createdAt)}-${index}`} style={updateCardStyle}>
                      <div style={updateHeaderStyle}>
                        <span style={updateTitleStyle}>Lần {index + 1}</span>
                        <span style={updateTimeStyle}>{formatTime(update.createdAt)}</span>
                      </div>
                      {updateIncident ? (
                        <div style={updateRowStyle}>
                          <span style={labelStyle}>Loại:</span>
                          <IncidentBadge incident={updateIncident} compact />
                        </div>
                      ) : null}
                      {updateDescription ? (
                        <div style={updateRowStyle}>
                          <span style={labelStyle}>Mô tả:</span>
                          <span style={descriptionStyle}>{updateDescription}</span>
                        </div>
                      ) : null}
                      {updateImages.length > 0 ? (
                        <div style={updateRowStyle}>
                          <span style={labelStyle}>Ảnh:</span>
                          <span>{updateImages.length} hình ảnh</span>
                        </div>
                      ) : null}
                      {updateAudio.length > 0 ? (
                        <div style={updateRowStyle}>
                          <span style={labelStyle}>Ghi âm:</span>
                          <span>{updateAudio.length} tệp</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {mediaUrls.length > 0 ? (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Hình ảnh ({mediaUrls.length})</div>
              <button
                type="button"
                style={actionBtnStyle}
                onClick={() => setShowGallery(true)}
              >
                Xem bộ sưu tập
              </button>
            </div>
          ) : null}

          {audioUrls.length > 0 ? (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Ghi âm ({audioUrls.length})</div>
              <button
                type="button"
                style={actionBtnStyle}
                onClick={() => setShowVoice(true)}
              >
                Phát ghi âm
              </button>
            </div>
          ) : null}

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Lịch sử cập nhật</div>
            <div style={timelineStyle}>
              {timelineUpdates.map((update) => (
                <div key={update.key} style={timelineItemStyle}>
                  <div style={timelineIconStyle}>{update.icon}</div>
                  <div>
                    <div style={timelineTitleStyle}>{update.title}</div>
                    {update.content ? (
                      <div style={timelineContentStyle}>{update.content}</div>
                    ) : null}
                    <div style={timelineTimeStyle}>
                      {formatTime(update.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showGallery ? (
        <GalleryModal sos={sos} onClose={() => setShowGallery(false)} />
      ) : null}
      {showVoice ? (
        <VoiceRecordModal sos={sos} onClose={() => setShowVoice(false)} />
      ) : null}
    </>
  );
}

function buildTimeline(sos) {
  if (!sos) return [];

  const timeline = [
    {
      key: 'initial',
      timestamp: sos.createdAt,
      type: 'initial',
      title: 'Gửi tín hiệu SOS',
      icon: 'SOS',
    },
  ];

  const detailUpdates = getIncidentUpdates(sos);

  if (detailUpdates.length > 0) {
    detailUpdates.forEach((update, index) => {
      const timestamp = update.createdAt || sos.updatedAt || sos.createdAt;
      const incident = getIncidentMeta(update.incidentType, { detailsSubmitted: true });
      const mediaUrls = getUpdateMediaUrls(update);
      const audioUrls = getUpdateAudioUrls(update);
      const description = getCleanText(update.description);
      const order = index + 1;

      if (incident) {
        timeline.push({
          key: `incident-${index}`,
          timestamp,
          type: 'incident',
          title: `Lần ${order}: Chọn loại sự cố ${incident.label}`,
          icon: '!',
        });
      }

      if (description) {
        timeline.push({
          key: `description-${index}`,
          timestamp,
          type: 'description',
          title: `Lần ${order}: Thêm mô tả`,
          content: description,
          icon: 'T',
        });
      }

      if (mediaUrls.length > 0) {
        timeline.push({
          key: `media-${index}`,
          timestamp,
          type: 'media',
          title: `Lần ${order}: Thêm ${mediaUrls.length} hình ảnh`,
          icon: 'IMG',
        });
      }

      if (audioUrls.length > 0) {
        timeline.push({
          key: `audio-${index}`,
          timestamp,
          type: 'audio',
          title: `Lần ${order}: Thêm ${audioUrls.length} ghi âm`,
          icon: 'REC',
        });
      }
    });

    return timeline;
  }

  const incident = getIncidentMeta(sos.incidentType, sos);
  if (incident) {
    timeline.push({
      key: 'incident',
      timestamp: sos.updatedAt || sos.createdAt,
      type: 'incident',
      title: `Chọn loại sự cố: ${incident.label}`,
      icon: '!',
    });
  }

  if (sos.description) {
    timeline.push({
      key: 'description',
      timestamp: sos.updatedAt || sos.createdAt,
      type: 'description',
      title: 'Thêm mô tả',
      content: sos.description,
      icon: 'T',
    });
  }

  const mediaUrls = getMediaUrls(sos);
  if (mediaUrls.length > 0) {
    timeline.push({
      key: 'media',
      timestamp: sos.updatedAt || sos.createdAt,
      type: 'media',
      title: `Thêm ${mediaUrls.length} hình ảnh`,
      icon: 'IMG',
    });
  }

  const audioUrls = getAudioUrls(sos);
  if (audioUrls.length > 0) {
    timeline.push({
      key: 'audio',
      timestamp: sos.updatedAt || sos.createdAt,
      type: 'audio',
      title: `Thêm ${audioUrls.length} ghi âm`,
      icon: 'REC',
    });
  }

  return timeline;
}

function getIncidentUpdates(sos) {
  return Array.isArray(sos?.incidentUpdates)
    ? sos.incidentUpdates.filter((item) => item && typeof item === 'object')
    : [];
}

function getAudioUrls(sos) {
  const topLevel = normalizeAudioUrls(sos?.audioUrl || sos?.audioRecordings);
  const fromUpdates = getIncidentUpdates(sos).flatMap(getUpdateAudioUrls);
  return uniqueStrings([...topLevel, ...fromUpdates]);
}

function getMediaUrls(sos) {
  const topLevel = normalizeMediaUrls(sos?.mediaUrl || sos?.mediaImages || sos?.mediaFiles);
  const fromUpdates = getIncidentUpdates(sos).flatMap(getUpdateMediaUrls);
  return uniqueStrings([...topLevel, ...fromUpdates]);
}

function getUpdateAudioUrls(update) {
  return normalizeAudioUrls(update?.audioUrl || update?.audioRecordings);
}

function getUpdateMediaUrls(update) {
  return normalizeMediaUrls(update?.mediaUrl || update?.mediaImages || update?.mediaFiles);
}

function normalizeAudioUrls(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.url || item.src || '';
        return '';
      })
      .filter((value) => typeof value === 'string' && value.trim().length > 0);
  }
  if (typeof raw === 'string' && raw.trim().length > 0) return [raw];
  if (raw && typeof raw === 'object' && raw.url) return [raw.url];
  return [];
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
  if (raw && typeof raw === 'object') {
    const src = raw.src || raw.url || raw.thumb;
    if (src) return [src];
  }
  return [];
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter((value) => typeof value === 'string' && value.trim())));
}

function getCleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getUpdateTimeKey(timestamp) {
  if (!timestamp) return '';
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.seconds === 'number') return timestamp.seconds;
  return String(timestamp);
}

function getSosAddress(sos) {
  return (
    sos.address ||
    sos.locationAddress ||
    sos.victimAddress ||
    sos.location?.address ||
    sos.location?.formattedAddress ||
    sos.location?.name ||
    'Chưa có địa chỉ'
  );
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

  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString('vi-VN');
}

SosDetailPanel.propTypes = {
  sos: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

SosDetailPanel.defaultProps = {
  sos: null,
};

const panelStyle = {
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  width: '420px',
  maxWidth: '100vw',
  background: '#FFFFFF',
  boxShadow: '-4px 0 16px rgba(0,0,0,0.12)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1100,
  fontFamily: 'Roboto, sans-serif',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #E5E7EB',
  flexShrink: 0,
};

const titleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#1F2937',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  color: '#6B7280',
  cursor: 'pointer',
  width: '32px',
  height: '32px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  padding: 0,
};

const contentStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px 20px',
};

const sectionStyle = {
  marginBottom: '20px',
};

const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#FF8852',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  paddingBottom: '10px',
  borderBottom: '1px solid #F3F4F6',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#6B7280',
  minWidth: '80px',
};

const descriptionStyle = {
  fontSize: '13px',
  color: '#374151',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const updateListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const updateCardStyle = {
  border: '1px solid #FFE0D2',
  background: '#FFF7F2',
  borderRadius: '8px',
  padding: '10px 12px',
};

const updateHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  gap: '12px',
};

const updateTitleStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#FF6B3A',
};

const updateTimeStyle = {
  fontSize: '11px',
  color: '#9CA3AF',
  whiteSpace: 'nowrap',
};

const updateRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  paddingTop: '7px',
  fontSize: '13px',
  color: '#374151',
};

const actionBtnStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: 'none',
  background: '#FF8852',
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const timelineStyle = {
  borderLeft: '2px solid #E5E7EB',
  paddingLeft: '16px',
};

const timelineItemStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
  position: 'relative',
};

const timelineIconStyle = {
  minWidth: '34px',
  height: '22px',
  marginLeft: '-28px',
  marginTop: '1px',
  borderRadius: '999px',
  background: '#FFF7F2',
  border: '1px solid #FFE0D2',
  color: '#FF6B3A',
  display: 'grid',
  placeItems: 'center',
  fontSize: '9px',
  fontWeight: 800,
};

const timelineTitleStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#1F2937',
};

const timelineContentStyle = {
  fontSize: '12px',
  color: '#6B7280',
  marginTop: '4px',
  lineHeight: 1.4,
};

const timelineTimeStyle = {
  fontSize: '11px',
  color: '#9CA3AF',
  marginTop: '4px',
};
