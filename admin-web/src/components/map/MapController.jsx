import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapController({ mapRef, selectedSos }) {
  const map = useMap();

  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }

    return () => {
      if (mapRef && mapRef.current === map) {
        mapRef.current = null;
      }
    };
  }, [map, mapRef]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (selectedSos) {
      const position = getSosPosition(selectedSos);
      if (position) {
        map.setView(position, 16, { animate: true });
      }
      return;
    }

    map.setZoom(13);
  }, [map, selectedSos]);

  return null;
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

MapController.propTypes = {
  mapRef: PropTypes.shape({ current: PropTypes.object }),
  selectedSos: PropTypes.object,
};

MapController.defaultProps = {
  mapRef: null,
  selectedSos: null,
};
