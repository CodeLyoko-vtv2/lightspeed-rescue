import PropTypes from 'prop-types';
import { COLORS } from '../../constants/colors.js';

export function MapControls({ onZoomIn, onZoomOut, onLocate }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '83px',
          borderRadius: '6px',
          background: COLORS.neutral.surface,
          border: `1px solid ${COLORS.palette.hex_e5e7eb_100}`,
          boxShadow: `0 10px 15px -3px ${COLORS.palette.hex_000000_010}, 0 4px 6px -4px ${COLORS.palette.hex_000000_010}`,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={onZoomIn}
          style={{
            ...buttonStyle,
            borderBottom: `1px solid ${COLORS.palette.hex_e5e7eb_100}`,
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          style={buttonStyle}
        >
          -
        </button>
      </div>
      <button
        type="button"
        onClick={onLocate}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          border: `1px solid ${COLORS.palette.hex_e5e7eb_100}`,
          background: COLORS.neutral.surface,
          boxShadow: `0 10px 15px -3px ${COLORS.palette.hex_000000_010}, 0 4px 6px -4px ${COLORS.palette.hex_000000_010}`,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          padding: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill={COLORS.palette.hex_4b5563_100}
            d="M11 4a1 1 0 0 1 2 0v1.07A7.002 7.002 0 0 1 19.93 11H21a1 1 0 1 1 0 2h-1.07A7.002 7.002 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A7.002 7.002 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A7.002 7.002 0 0 1 11 5.07V4Zm1 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
          />
        </svg>
      </button>
    </div>
  );
}

const buttonStyle = {
  width: '40px',
  height: '41px',
  border: 'none',
  background: COLORS.neutral.surface,
  color: COLORS.palette.hex_4b5563_100,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '16px',
};

MapControls.propTypes = {
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onLocate: PropTypes.func.isRequired,
};
