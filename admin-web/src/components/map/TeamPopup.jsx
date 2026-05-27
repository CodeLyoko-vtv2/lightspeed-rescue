import { useState, useEffect, useRef } from 'react';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase.js';
import PropTypes from 'prop-types';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/**
 * State machine for the dispatch popup.
 */
const S = {
  IDLE:     'idle',
  PENDING:  'pending',
  ACTIVE:   'active',
  RECEIVED: 'received',
  UPDATE:   'update',
};

const INVISIBLE_ICON = L.divIcon({
  className: '',
  html: '',
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

function formatPhone(phone) {
  if (!phone) return '';
  const n = String(phone).trim();
  if (n.startsWith('+')) return n;
  if (n.startsWith('0') || n.startsWith('02')) return `(+84) ${n.slice(1)}`;
  return n;
}

export function TeamPopup({ team, position, sosId, onClose, onDispatched, onDispatchDenied, missionComplete, canDispatch }) {
  const markerRef = useRef(null);
  const [state, setState] = useState(S.IDLE);
  const [isDispatching, setIsDispatching] = useState(false);
  const [missionId, setMissionId] = useState(null);
  const acceptedNotifiedRef = useRef(false);

  /* Open popup after marker is rendered. */
  useEffect(() => {
    const t = setTimeout(() => markerRef.current?.openPopup(), 60);
    return () => clearTimeout(t);
  }, [team?.id]);

  /* Close popup when mission is completed externally. */
  useEffect(() => {
    if (missionComplete) onClose();
  }, [missionComplete, onClose]);

  useEffect(() => {
    if (!missionId) return undefined;

    const unsubscribe = onSnapshot(doc(firestore, 'rescue_missions', missionId), async (snapshot) => {
      if (!snapshot.exists()) return;
      const mission = snapshot.data();

      if (mission.status === 'accepted' && !acceptedNotifiedRef.current) {
        acceptedNotifiedRef.current = true;
        setState(S.ACTIVE);
        setIsDispatching(false);
        onDispatched?.(team);

        setTimeout(() => {
          setState(S.RECEIVED);
          setTimeout(() => {
            setState(S.UPDATE);
          }, 3500);
        }, 1000);
      }

      if (mission.status === 'rejected') {
        const reason = mission.rejectReason || mission.rejectedReason || mission.reason || '';
        if (sosId) {
          await updateDoc(doc(firestore, 'sos_alerts', sosId), {
            status: 'pending',
            rescuerId: null,
            dispatchStatus: 'rejected',
            rejectReason: reason,
            updatedAt: serverTimestamp(),
          });
        }
        onDispatchDenied?.({ ...team, reason, rejectReason: reason });
        setMissionId(null);
        setState(S.IDLE);
        setIsDispatching(false);
        acceptedNotifiedRef.current = false;
      }
    });

    return () => unsubscribe();
  }, [missionId, onDispatchDenied, onDispatched, sosId, team]);

  /* State machine */
  const handleDispatchRescue = async (targetSosId, rescuerId) => {
    if (!targetSosId) return;
    await updateDoc(doc(firestore, 'sos_alerts', targetSosId), {
      rescuerId,
      dispatchStatus: 'assigned',
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const missionRef = await addDoc(collection(firestore, 'rescue_missions'), {
      sosId: targetSosId,
      rescuerId,
      status: 'pending',
      assignedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    setMissionId(missionRef.id);
    return missionRef.id;
  };

  const handleDispatch = async () => {
    if (state !== S.IDLE || isDispatching || !canDispatch) return;
    setIsDispatching(true);
    setState(S.PENDING);

    const rescuerId = team?.id;
    if (!rescuerId) {
      setState(S.IDLE);
      setIsDispatching(false);
      return;
    }
    try {
      acceptedNotifiedRef.current = false;
      await handleDispatchRescue(sosId, rescuerId);
    } catch (error) {
      console.error('Dispatch error:', error);
      setState(S.IDLE);
      setIsDispatching(false);
    }
  };

  if (!team || !position) return null;

  const phone = formatPhone(team.phone);

  /* Nội dung nút theo từng trạng thái */
  const isDispatchingState = state !== S.IDLE || isDispatching;

  const btnLabel = {
    [S.IDLE]:     'Điều động cứu hộ',
    [S.PENDING]:  'Chờ phản hồi...',
    [S.ACTIVE]:   'Đang thực hiện nhiệm vụ...',
    [S.RECEIVED]: 'Đang thực hiện nhiệm vụ...',
    [S.UPDATE]:   'Đang thực hiện nhiệm vụ...',
  }[state];

  const btnBg = state === S.IDLE ? '#2563EB' : '#6B7280';

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={INVISIBLE_ICON}
      zIndexOffset={1100}
    >
      <Popup
        className="team-popup"
        closeButton={false}
        autoPan={false}
        offset={[0, -60]}
      >
        <div style={wrapStyle}>
          {/* Nút X chỉ hiện khi chưa điều động */}
          {!isDispatchingState && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={closeBtnStyle}
              aria-label="Đóng"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor"
                strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 1L1 13M1 1l12 12"/>
              </svg>
            </button>
          )}

          {/* Tên đội */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A73E8',
            marginBottom: '8px', paddingRight: isDispatching ? 0 : '16px' }}>
            {team.name || 'Đội cứu hộ'}
          </div>

          {/* Số điện thoại */}
          {phone ? (
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
              {phone}
            </div>
          ) : null}

          {/* Địa chỉ */}
          <div style={{ fontSize: '11px', color: '#555555', marginBottom: '12px', lineHeight: 1.4 }}>
            {team.address || ''}
          </div>

          {/* Nút Điều động */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDispatch(); }}
            disabled={isDispatchingState}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: btnBg,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isDispatchingState ? 'default' : 'pointer',
              fontFamily: 'Roboto, sans-serif',
              transition: 'background 250ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {state === S.PENDING ? <Spinner /> : null}
            {btnLabel}
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

/* Helper components */
function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: '12px', height: '12px',
      border: '2px solid rgba(255,255,255,0.4)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'teamPopupSpin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function StatusDot({ color }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '7px', height: '7px',
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }} />
  );
}
StatusDot.propTypes = { color: PropTypes.string.isRequired };

/* Styles */
const wrapStyle = {
  fontFamily: 'Roboto, sans-serif',
  width: '220px',
  position: 'relative',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  background: 'none',
  border: 'none',
  color: '#555555',
  cursor: 'pointer',
  width: '20px',
  height: '20px',
  display: 'grid',
  placeItems: 'center',
  padding: 0,
};

TeamPopup.propTypes = {
  team: PropTypes.object,
  position: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onClose: PropTypes.func.isRequired,
  onDispatched: PropTypes.func,
  onDispatchDenied: PropTypes.func,
  missionComplete: PropTypes.bool,
  canDispatch: PropTypes.bool,
  sosId: PropTypes.string,
};
TeamPopup.defaultProps = { team: null, position: null, sosId: null, onDispatched: null, onDispatchDenied: null, missionComplete: false, canDispatch: true };
