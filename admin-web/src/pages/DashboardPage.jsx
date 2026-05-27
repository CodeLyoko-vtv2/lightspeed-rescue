import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { SearchBox } from '../components/map/SearchBox.jsx';
import { FilterTabs } from '../components/map/FilterTabs.jsx';
import { MapControls } from '../components/map/MapControls.jsx';
import { RescueMap } from '../components/map/RescueMap.jsx';
import { SosCard } from '../components/sos/SosCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSosRealtime } from '../hooks/useSosRealtime.js';
import { useTeamLocations } from '../hooks/useTeamLocations.js';
import { useTeamsMock } from '../hooks/useTeamsMock.js';
import { COLORS } from '../constants/colors.js';
import { SosAlertToast } from '../components/sos/SosAlertToast.jsx';
import { DispatchToast } from '../components/sos/DispatchToast.jsx';
import { DeniedToast } from '../components/sos/DeniedToast.jsx';
import { SosDetailPanel } from '../components/sos/SosDetailPanel.jsx';
import { auth, firestore } from '../firebase.js';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const { sosList: realtimeSosList, loading: sosLoading } = useSosRealtime();
  const activeSOSList = realtimeSosList;
  const { teams: mockTeams } = useTeamsMock();
  const [selectedSosId, setSelectedSosId] = useState(null);
  const [selectedSosOpenKey, setSelectedSosOpenKey] = useState(0);
  const [detailSosId, setDetailSosId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  // Alert toast
  const [sosToasts, setSosToasts] = useState([]);
  const toastSosId = null;
  const updateToastSosId = null;
  const setToastSosId = () => {};
  const setUpdateToastSosId = () => {};
  // Dispatch mode
  const [dispatchMode, setDispatchMode] = useState(false);
  const [dispatchSos, setDispatchSos] = useState(null);    // SOS đang được cứu hộ
  const [selectedTeam, setSelectedTeam] = useState(null);  // Team được chọn
  const [dispatchToast, setDispatchToast] = useState(null); // { team, victim }
  const [completedToast, setCompletedToast] = useState(null);
  const [deniedToast, setDeniedToast] = useState(null); // Hiện toast góc dưới trái khi TỪ CHỐI
  const [missionComplete, setMissionComplete] = useState(false); // báo hiệu popup đóng
  const mapRef = useRef(null);
  const cardRefs = useRef({});
  const seenSosIdsRef = useRef(new Set());
  const sosDetailSignatureRef = useRef(new Map());
  const completedMissionSeenRef = useRef(new Set());
  const completedMissionReadyRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const addSosToast = (sosId, variant) => {
    setSosToasts((prev) => {
      const nextToast = {
        id: `${variant}-${sosId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sosId,
        variant,
      };
      return [...prev, nextToast].slice(-5);
    });
  };

  const dismissSosToast = (toastId) => {
    setSosToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  };

  useEffect(() => {
    const updates = [];
    let nextNewToastId = null;

    realtimeSosList.forEach((item) => {
      const alreadySeen = seenSosIdsRef.current.has(item.id);
      if (!alreadySeen && !nextNewToastId) {
        nextNewToastId = item.id;
      }
      seenSosIdsRef.current.add(item.id);

      const signature = getSosDetailSignature(item);
      const previousSignature = sosDetailSignatureRef.current.get(item.id);
      if (alreadySeen && previousSignature && previousSignature !== signature) {
        updates.push(item.id);
      }
      sosDetailSignatureRef.current.set(item.id, signature);
    });

    if (nextNewToastId) {
      addSosToast(nextNewToastId, 'alert');
    }
    if (updates.length > 0) {
      updates.forEach((id) => addSosToast(id, 'update'));
    }
    setSosToasts((prev) => prev.filter((toast) => realtimeSosList.some((item) => item.id === toast.sosId)));
  }, [realtimeSosList]);

  useEffect(() => {
    const completedQuery = query(
      collection(firestore, 'rescue_missions'),
      where('status', '==', 'completed'),
    );

    const unsubscribe = onSnapshot(completedQuery, async (snapshot) => {
      const completedChanges = snapshot.docChanges()
        .filter((change) => change.type === 'added' || change.type === 'modified');

      for (const change of completedChanges) {
        const missionId = change.doc.id;
        if (completedMissionSeenRef.current.has(missionId)) {
          continue;
        }
        completedMissionSeenRef.current.add(missionId);

        if (!completedMissionReadyRef.current) {
          continue;
        }

        const mission = { id: missionId, ...change.doc.data() };
        const [victim, team] = await Promise.all([
          loadSosForMission(mission.sosId),
          loadTeamForMission(mission.rescuerId),
        ]);

        setCompletedToast({
          missionId,
          victim: victim || { id: mission.sosId },
          team: team || { id: mission.rescuerId, name: 'Đội cứu hộ' },
        });
        setDispatchToast(null);
        handleMissionComplete();
      }

      completedMissionReadyRef.current = true;
    });

    return () => unsubscribe();
  }, []);

  const sosIds = useMemo(() => activeSOSList.map((item) => item.id), [activeSOSList]);
  const detailSos = useMemo(
    () => activeSOSList.find((item) => item.id === detailSosId) || null,
    [activeSOSList, detailSosId],
  );
  const { teamLocations, teamProfiles } = useTeamLocations(sosIds);

  // Merge Firebase teams + mock teams (mock teams luôn hiện cho dev)
  const teamList = useMemo(() => {
    const teamIds = Array.from(new Set([
      ...Object.keys(teamProfiles),
      ...Object.keys(teamLocations),
    ]));
    const fbTeams = teamIds
      .map((teamId) => {
        const data = teamLocations[teamId] || {};
        const profile = teamProfiles[teamId] || {};
        const profileLocation = profile?.currentLocation || profile?.location || {};
        const lat = profileLocation?.lat ?? profileLocation?.latitude ?? data?.lat ?? data?.latitude;
        const lng = profileLocation?.lng ?? profileLocation?.longitude ?? data?.lng ?? data?.longitude;
        const isAvailable = profile?.isAvailable !== false;
        const address =
          profile?.address ||
          profile?.locationAddress ||
          data?.address ||
          (typeof lat === 'number' && typeof lng === 'number' ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '');
        return {
          id: teamId,
          name: profile?.fullName || data?.name || 'Đội cứu hộ',
          phone: profile?.phoneNumber || data?.phone || '',
          address,
          type: profile?.unitCategory || data?.type || 'Quân đội',
          status: profile?.status || (isAvailable ? 'available' : 'busy'),
          isAvailable,
          isLiveRescueApp: true,
          location: { lat, lng },
        };
      })
      .filter((t) => {
        const profile = teamProfiles[t.id] || {};
        return (
          profile?.locationSource === 'rescue-app' &&
          isRecentTeamLocation(profile?.lastLocationUpdate) &&
          typeof t.location.lat === 'number' &&
          typeof t.location.lng === 'number'
        );
      });
    return dispatchMode ? fbTeams : [...mockTeams, ...fbTeams];
  }, [teamLocations, teamProfiles, mockTeams, dispatchMode]);

  const handleCardClick = (sos) => {
    if (!sos) { setSelectedSosId(null); return; }
    setSelectedSosId(sos.id);
    setSelectedSosOpenKey((value) => value + 1);
    setDetailSosId(sos.id);
    const position = getSosPosition(sos);
    if (position && mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], 16, { animate: true });
    }
  };

  const handleMarkerClick = (sos) => {
    if (!sos) { setSelectedSosId(null); return; }
    setSelectedSosId(sos.id);
    setSelectedSosOpenKey((value) => value + 1);
    setDetailSosId(sos.id);
    const position = getSosPosition(sos);
    if (position && mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], 16, { animate: true });
    }
    const node = cardRefs.current[sos.id];
    if (node?.scrollIntoView) node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleClosePopup = () => {
    setSelectedSosId(null);
    if (mapRef.current) mapRef.current.setZoom(13);
  };

  const handleOpenDetail = (sos) => {
    setDetailSosId(sos.id);
  };

  const handleCloseDetail = () => {
    setDetailSosId(null);
  };

  /* ── Dispatch handlers ── */
  const handleDispatchMode = (sos) => {
    // Click "Triển khai cứu hộ" trong MapZoomPopup
    setDispatchSos(sos);
    setDispatchMode(true);
    setSelectedSosId(null); // Ẩn popup nạn nhân
    // Zoom out để thấy cả teams xung quanh
    if (mapRef.current && sos) {
      const pos = getSosPosition(sos);
      if (pos) mapRef.current.setView([pos.lat, pos.lng], 14, { animate: true });
    }
  };

  const handleTeamClick = (team) => setSelectedTeam(team);
  const handleTeamClose = () => setSelectedTeam(null);

  const handleTeamDispatched = (team) => {
    // Team nhận nhiệm vụ: hiện DispatchToast, nhưng KHÔNG đóng popup
    setDispatchToast({ team, victim: dispatchSos });
    setDeniedToast(null);
    setMissionComplete(false); // reset tính hiệu
    // Giữ dispatchMode và selectedTeam để popup vẫn hiện
  };

  const handleTeamDispatchDenied = (team) => {
    // Team từ chối nhiệm vụ: hiện DeniedToast
    setDeniedToast({ team, victim: dispatchSos });
    setDispatchToast(null);
  };

  function handleMissionComplete() {
    // DispatchToast báo "Nhiệm vụ hoàn thành" → đóng popup
    setMissionComplete(true);
    // Dọn state sau một tick để TeamPopup kịp nhận tín hiệu
    setTimeout(() => {
      setDispatchMode(false);
      setSelectedTeam(null);
      setMissionComplete(false);
    }, 500);
  }

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1);
  };
  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1);
  };
  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const adminName =
    currentUser?.displayName || currentUser?.email || 'Admin';

  const activePage = getActivePage(location.pathname);

  useEffect(() => {
    if (!selectedSosId) {
      return;
    }

    const node = cardRefs.current[selectedSosId];
    if (node?.scrollIntoView) {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSosId]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          if (page === 'menu') {
            navigate('/');
            return;
          }
          if (page === 'teams') {
            navigate('/teams');
            return;
          }
          if (page === 'logout') {
            signOut(auth).then(() => navigate('/login', { replace: true }));
            return;
          }
          navigate('/');
        }}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <RescueMap
          mapRef={mapRef}
          sosList={activeSOSList}
          selectedSosId={selectedSosId}
          selectedSosOpenKey={selectedSosOpenKey}
          onMarkerClick={handleMarkerClick}
          teamList={teamList}
          activeFilter={activeFilter}
          onDispatch={handleDispatchMode}
          onClosePopup={handleClosePopup}
          dispatchMode={dispatchMode}
          dispatchSosId={dispatchSos?.id}
          selectedTeam={selectedTeam}
          onTeamClick={handleTeamClick}
          onTeamClose={handleTeamClose}
          onTeamDispatched={handleTeamDispatched}
          onDispatchDenied={handleTeamDispatchDenied}
          missionComplete={missionComplete}
        />
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <SearchBox adminName={adminName} mapRef={mapRef} />
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
        <div style={{ position: 'absolute', left: '16px', top: '50%', zIndex: 1000 }}>
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onLocate={handleLocate}
          />
        </div>
        {sosToasts.length > 0 && !dispatchMode && !dispatchToast ? (
          <div style={toastStackStyle}>
            {sosToasts.map((toast) => {
              const toastSos = activeSOSList.find((s) => s.id === toast.sosId);
              return toastSos ? (
                <SosAlertToast
                  key={toast.id}
                  sos={toastSos}
                  variant={toast.variant}
                  style={stackedToastStyle}
                  onViewOnMap={(sos) => {
                    dismissSosToast(toast.id);
                    handleCardClick(sos);
                  }}
                  onDismiss={() => dismissSosToast(toast.id)}
                />
              ) : null;
            })}
          </div>
        ) : null}

        {/* SOS Alert Toast — góc dưới trái map */}
        {toastSosId && !dispatchMode && !dispatchToast ? (() => {
          const toastSos = activeSOSList.find((s) => s.id === toastSosId);
          return toastSos ? (
            <SosAlertToast
              key={toastSos.id}
              sos={toastSos}
              onViewOnMap={(sos) => { setToastSosId(null); handleCardClick(sos); }}
              onDismiss={() => setToastSosId(null)}
            />
          ) : null;
        })() : null}

        {/* SOS Update Toast — khi nạn nhân bổ sung thông tin */}
        {updateToastSosId && !toastSosId && !dispatchMode && !dispatchToast ? (() => {
          const toastSos = activeSOSList.find((s) => s.id === updateToastSosId);
          return toastSos ? (
            <SosAlertToast
              key={`update-${toastSos.id}`}
              sos={toastSos}
              variant="update"
              onViewOnMap={(sos) => { setUpdateToastSosId(null); handleCardClick(sos); }}
              onDismiss={() => setUpdateToastSosId(null)}
            />
          ) : null;
        })() : null}

        {/* Dispatch Toast — góc dưới trái khi team được điều động */}
        {dispatchToast ? (
          <DispatchToast
            team={dispatchToast.team}
            victim={dispatchToast.victim}
            onClose={() => setDispatchToast(null)}
            onMissionComplete={handleMissionComplete}
            completionDelayMs={10000}
          />
        ) : null}

        {/* Denied Toast — góc dưới trái khi team từ chối điều động */}
        {completedToast ? (
          <DispatchToast
            key={completedToast.missionId}
            team={completedToast.team}
            victim={completedToast.victim}
            initialPhase="completed"
            autoProgress={false}
            onClose={() => setCompletedToast(null)}
            onMissionComplete={handleMissionComplete}
          />
        ) : null}

        {deniedToast ? (
          <DeniedToast
            team={deniedToast.team}
            victim={deniedToast.victim}
            onClose={() => setDeniedToast(null)}
          />
        ) : null}
      </div>
      <div
        style={{
          width: '350px',
          background: COLORS.neutral.surface,
          borderLeft: `1px solid ${COLORS.palette.hex_d9dde9_100}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${COLORS.palette.hex_d9dde9_100}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '0px',
              color: '#1A73E8',
            }}
          >
            <span style={{ fontSize: '16px' }}>Danh sách nạn nhân</span>
            Danh sách nạn nhân
          </div>
          <span
            style={{
              color: '#1A73E8',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {activeSOSList.length}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {sosLoading ? (
            <div
              style={{
                padding: '24px 16px',
                fontSize: '13px',
                color: COLORS.palette.hex_6b7280_100,
                textAlign: 'center',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              Đang tải dữ liệu...
            </div>
          ) : null}
          {!sosLoading && activeSOSList.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                fontSize: '13px',
                color: COLORS.palette.hex_6b7280_100,
                textAlign: 'center',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              Chưa có SOS nào.
            </div>
          ) : null}
          {activeSOSList.map((sos) => (
            <SosCard
              key={sos.id}
              sos={sos}
              isSelected={selectedSosId === sos.id}
              onClick={handleCardClick}
              onDetail={() => handleOpenDetail(sos)}
              onDispatch={(item) => navigate(`/sos/${item.id}`)}
              onVoiceRecord={() => handleCardClick(sos)}
              onGallery={() => handleCardClick(sos)}
              cardRef={(node) => {
                if (node) {
                  cardRefs.current[sos.id] = node;
                }
              }}
            />
          ))}
        </div>
      </div>
      {detailSos ? (
        <SosDetailPanel sos={detailSos} onClose={handleCloseDetail} />
      ) : null}
    </div>
  );
}

function getActivePage(pathname) {
  if (pathname.includes('notifications')) {
    return 'notifications';
  }
  if (pathname.includes('recent')) {
    return 'recent';
  }
  if (pathname.includes('teams')) {
    return 'teams';
  }
  if (pathname.includes('settings')) {
    return 'settings';
  }
  return 'menu';
}

const toastStackStyle = {
  position: 'absolute',
  bottom: '24px',
  left: '16px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '12px',
  pointerEvents: 'none',
};

const stackedToastStyle = {
  position: 'static',
  left: 'auto',
  bottom: 'auto',
  pointerEvents: 'auto',
};

function getSosPosition(sos) {
  if (sos?.location?.lat && sos?.location?.lng) {
    return { lat: sos.location.lat, lng: sos.location.lng };
  }
  if (sos?.location?.latitude && sos?.location?.longitude) {
    return { lat: sos.location.latitude, lng: sos.location.longitude };
  }
  if (sos?.victimLocation?.lat && sos?.victimLocation?.lng) {
    return { lat: sos.victimLocation.lat, lng: sos.victimLocation.lng };
  }
  if (sos?.victimLocation?.latitude && sos?.victimLocation?.longitude) {
    return { lat: sos.victimLocation.latitude, lng: sos.victimLocation.longitude };
  }
  return null;
}

function getSosDetailSignature(sos) {
  const incidentType = String(sos?.incidentType || '');
  const description = String(sos?.description || '');
  const mediaCount = getMediaUrls(sos).length;
  const audioCount = getAudioUrls(sos).length;
  const updateCount = Array.isArray(sos?.incidentUpdates) ? sos.incidentUpdates.length : 0;
  return `${incidentType}|${description}|${mediaCount}|${audioCount}|${updateCount}`;
}

async function loadSosForMission(sosId) {
  if (!sosId) return null;
  try {
    const snap = await getDoc(doc(firestore, 'sos_alerts', sosId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    console.warn('Khong the lay SOS da hoan thanh:', error);
    return null;
  }
}

function isRecentTeamLocation(timestamp) {
  if (!timestamp) return false;
  const millis = timestamp?.toMillis
    ? timestamp.toMillis()
    : new Date(timestamp).getTime();
  if (!Number.isFinite(millis)) return false;
  return Date.now() - millis <= 10 * 60 * 1000;
}

async function loadTeamForMission(rescuerId) {
  if (!rescuerId) return null;
  try {
    const userSnap = await getDoc(doc(firestore, 'Users', rescuerId));
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        name: data.fullName || data.name || data.displayName || 'Đội cứu hộ',
        phone: data.phoneNumber || data.hotline || data.phone || '',
        address: data.address || data.locationAddress || '',
      };
    }

    const teamSnap = await getDoc(doc(firestore, 'rescue_teams', rescuerId));
    if (teamSnap.exists()) {
      const data = teamSnap.data();
      return {
        id: teamSnap.id,
        name: data.fullName || data.name || data.displayName || 'Đội cứu hộ',
        phone: data.phoneNumber || data.hotline || data.phone || '',
        address: data.address || data.locationAddress || '',
      };
    }
  } catch (error) {
    console.warn('Khong the lay doi cuu ho da hoan thanh:', error);
  }
  return null;
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
