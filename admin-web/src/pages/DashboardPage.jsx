import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { SearchBox } from '../components/map/SearchBox.jsx';
import { FilterTabs } from '../components/map/FilterTabs.jsx';
import { MapControls } from '../components/map/MapControls.jsx';
import { RescueMap } from '../components/map/RescueMap.jsx';
import { SosCard } from '../components/sos/SosCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSosMock } from '../hooks/useSosMock.js';
import { useTeamLocations } from '../hooks/useTeamLocations.js';
import { useTeamsMock } from '../hooks/useTeamsMock.js';
import { COLORS } from '../constants/colors.js';
import { SosAlertToast } from '../components/sos/SosAlertToast.jsx';
import { DispatchToast } from '../components/sos/DispatchToast.jsx';
import { DeniedToast } from '../components/sos/DeniedToast.jsx';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const { sosList, loading: sosLoading } = useSosMock();
  const { teams: mockTeams } = useTeamsMock();
  const [selectedSosId, setSelectedSosId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  // Alert toast
  const [toastSosId, setToastSosId] = useState('sos-001');
  // Dispatch mode
  const [dispatchMode, setDispatchMode] = useState(false);
  const [dispatchSos, setDispatchSos] = useState(null);    // SOS đang được cứu hộ
  const [selectedTeam, setSelectedTeam] = useState(null);  // Team được chọn
  const [dispatchToast, setDispatchToast] = useState(null); // { team, victim }
  const [deniedToast, setDeniedToast] = useState(null); // Hiện toast góc dưới trái khi TỪ CHỐI
  const [missionComplete, setMissionComplete] = useState(false); // báo hiệu popup đóng
  const mapRef = useRef(null);
  const cardRefs = useRef({});
  const location = useLocation();
  const navigate = useNavigate();

  const sosIds = useMemo(() => sosList.map((item) => item.id), [sosList]);
  const { teamLocations } = useTeamLocations(sosIds);

  // Merge Firebase teams + mock teams (mock teams luôn hiện cho dev)
  const teamList = useMemo(() => {
    const fbTeams = Object.entries(teamLocations)
      .map(([teamId, data]) => ({
        id: teamId,
        name: data?.name || 'Đội cứu hộ',
        phone: data?.phone || '',
        address: data?.address || '',
        type: data?.type || 'Quân đội',
        location: { lat: data?.lat ?? data?.latitude, lng: data?.lng ?? data?.longitude },
      }))
      .filter((t) => typeof t.location.lat === 'number' && typeof t.location.lng === 'number');
    return [...mockTeams, ...fbTeams];
  }, [teamLocations, mockTeams]);

  const handleCardClick = (sos) => {
    if (!sos) { setSelectedSosId(null); return; }
    setSelectedSosId(sos.id);
    const position = getSosPosition(sos);
    if (position && mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], 16, { animate: true });
    }
  };

  const handleMarkerClick = (sos) => {
    if (!sos) { setSelectedSosId(null); return; }
    setSelectedSosId(sos.id);
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

  const handleMissionComplete = () => {
    // DispatchToast báo "Nhiệm vụ hoàn thành" → đóng popup
    setMissionComplete(true);
    // Dọn state sau một tick để TeamPopup kịp nhận tín hiệu
    setTimeout(() => {
      setDispatchMode(false);
      setSelectedTeam(null);
      setMissionComplete(false);
    }, 500);
  };

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
          navigate('/');
        }}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <RescueMap
          mapRef={mapRef}
          sosList={sosList}
          selectedSosId={selectedSosId}
          onMarkerClick={handleMarkerClick}
          teamList={teamList}
          activeFilter={activeFilter}
          onDispatch={handleDispatchMode}
          onClosePopup={handleClosePopup}
          dispatchMode={dispatchMode}
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

        {/* SOS Alert Toast — góc dưới trái map */}
        {toastSosId && !dispatchMode && !dispatchToast ? (() => {
          const toastSos = sosList.find((s) => s.id === toastSosId);
          return toastSos ? (
            <SosAlertToast
              key={toastSos.id}
              sos={toastSos}
              onViewOnMap={(sos) => { setToastSosId(null); handleCardClick(sos); }}
              onDismiss={() => setToastSosId(null)}
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
          width: '280px',
          background: COLORS.neutral.surface,
          borderLeft: `1px solid ${COLORS.palette.hex_d9dde9_100}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: `1px solid ${COLORS.palette.hex_d9dde9_100}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: '15px',
              color: COLORS.palette.hex_313a51_100,
            }}
          >
            Danh sách nạn nhân
          </div>
          <span
            style={{
              minWidth: '22px',
              height: '22px',
              borderRadius: '999px',
              padding: '0 6px',
              background: COLORS.palette.hex_ff8852_100,
              color: COLORS.neutral.surface,
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sosList.length}
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
          {!sosLoading && sosList.length === 0 ? (
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
          {sosList.map((sos) => (
            <SosCard
              key={sos.id}
              sos={sos}
              isSelected={selectedSosId === sos.id}
              onClick={handleCardClick}
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
