import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';

/**
 * MapOverlayPortal — wraps react-leaflet <Popup> để giữ interface tương tự
 * với Google Maps OverlayView cũ. Popup tự hiển thị tại position.
 */
export function MapOverlayPortal({ position, className, children }) {
  if (!position) {
    return null;
  }

  return (
    <Popup
      position={position}
      className={className || ''}
      closeButton={false}
      autoPan={false}
      offset={[0, -10]}
    >
      {children}
    </Popup>
  );
}

MapOverlayPortal.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  pane: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
};

MapOverlayPortal.defaultProps = {
  position: null,
  pane: 'floatPane',
  className: '',
  style: null,
};
