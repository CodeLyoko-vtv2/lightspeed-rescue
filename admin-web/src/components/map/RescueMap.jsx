import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { SosMarker } from './SosMarker.jsx';
import { TeamMarker } from './TeamMarker.jsx';
import { TeamPopup } from './TeamPopup.jsx';
import { MapZoomPopup } from './MapZoomPopup.jsx';
import { MapController } from './MapController.jsx';

const DEFAULT_CENTER = { lat: 16.0544, lng: 108.2022 };

export function RescueMap({
  mapRef,
  sosList,
  selectedSosId,
  selectedSosOpenKey,
  onMarkerClick,
  teamList,
  activeFilter,
  onDispatch,
  onClosePopup,
  // Dispatch mode
  dispatchMode,
  dispatchSosId,
  selectedTeam,
  onTeamClick,
  onTeamClose,
  onTeamDispatched,
  onDispatchDenied,
  missionComplete,
}) {
  const selectedSos = useMemo(
    () => sosList.find((item) => item.id === selectedSosId),
    [sosList, selectedSosId],
  );

  const center = useMemo(() => {
    const focus = selectedSos || sosList[0];
    const position = getSosPosition(focus);
    return position || DEFAULT_CENTER;
  }, [selectedSos, sosList]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={mapContainerStyle}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapController mapRef={mapRef} selectedSos={selectedSos} />

      {/* SOS markers */}
      {sosList.map((sos) => (
        <SosMarker
          key={sos.id}
          sos={sos}
          isSelected={selectedSosId === sos.id}
          onClick={onMarkerClick}
        />
      ))}

      {/* Team markers */}
      {teamList.map((team) => (
        <TeamMarker
          key={team.id}
          team={team}
          location={team.location}
          activeFilter={activeFilter}
          dispatchMode={dispatchMode}
          onClick={onTeamClick}
        />
      ))}

      {/* SOS zoom popup */}
      {selectedSos && getSosPosition(selectedSos) && !dispatchMode ? (
        <MapZoomPopup
          key={`${selectedSos.id}-${selectedSosOpenKey}`}
          sos={selectedSos}
          position={getSosPosition(selectedSos)}
          openKey={selectedSosOpenKey}
          onClose={onClosePopup}
          onDispatch={onDispatch}
        />
      ) : null}

      {/* Team popup — hiện khi click vào bất kỳ team marker nào */}
      {selectedTeam && selectedTeam.location ? (
        <TeamPopup
          team={selectedTeam}
          position={selectedTeam.location}
          sosId={dispatchSosId}
          onClose={onTeamClose}
          onDispatched={onTeamDispatched}
          onDispatchDenied={onDispatchDenied}
          missionComplete={missionComplete}
          canDispatch={dispatchMode}
        />
      ) : null}
    </MapContainer>
  );
}

const mapContainerStyle = { width: '100%', height: '100%' };

function getSosPosition(sos) {
  if (sos?.location?.lat && sos?.location?.lng) return { lat: sos.location.lat, lng: sos.location.lng };
  if (sos?.location?.latitude && sos?.location?.longitude) return { lat: sos.location.latitude, lng: sos.location.longitude };
  if (sos?.victimLocation?.lat && sos?.victimLocation?.lng) return { lat: sos.victimLocation.lat, lng: sos.victimLocation.lng };
  return null;
}

RescueMap.propTypes = {
  mapRef: PropTypes.shape({ current: PropTypes.object }),
  sosList: PropTypes.arrayOf(PropTypes.object),
  selectedSosId: PropTypes.string,
  selectedSosOpenKey: PropTypes.number,
  onMarkerClick: PropTypes.func.isRequired,
  teamList: PropTypes.arrayOf(PropTypes.object),
  activeFilter: PropTypes.string,
  onDispatch: PropTypes.func.isRequired,
  onClosePopup: PropTypes.func.isRequired,
  dispatchMode: PropTypes.bool,
  selectedTeam: PropTypes.object,
  onTeamClick: PropTypes.func,
  onTeamClose: PropTypes.func,
  onTeamDispatched: PropTypes.func,
  onDispatchDenied: PropTypes.func,
  missionComplete: PropTypes.bool,
  dispatchSosId: PropTypes.string,
};

RescueMap.defaultProps = {
  mapRef: null,
  sosList: [],
  selectedSosId: null,
  selectedSosOpenKey: 0,
  teamList: [],
  activeFilter: null,
  dispatchMode: false,
  selectedTeam: null,
  onTeamClick: null,
  onTeamClose: null,
  onTeamDispatched: null,
  onDispatchDenied: null,
  missionComplete: false,
  dispatchSosId: null,
};
