import PropTypes from 'prop-types';
import { COLORS } from '../../constants/colors.js';
import armyIcon from '../../assets/img/temaki_army-tent.svg';
import policeIcon from '../../assets/img/mdi_police-station.svg';
import fireIcon from '../../assets/img/mdi_fire-station.svg';
import hospitalIcon from '../../assets/img/solar_hospital-bold.svg';

const FILTERS = [
  { id: 'Quân đội', label: 'Quân đội', icon: armyIcon },
  { id: 'Công an', label: 'Công an', icon: policeIcon },
  { id: 'Cứu hỏa', label: 'Cứu hỏa', icon: fireIcon },
  { id: 'Bệnh viện', label: 'Bệnh viện', icon: hospitalIcon },
];

export function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() =>
              onFilterChange(isActive ? null : filter.id)
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px 6px 8px',
              borderRadius: '24px',
              border: `1px solid ${
                isActive
                  ? COLORS.palette.hex_1a73e8_100
                  : COLORS.palette.hex_ffffff_100
              }`,
              background: COLORS.neutral.surface,
              color: COLORS.palette.hex_000000_090,
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.3px',
              fontFamily: 'Roboto, sans-serif',
              boxShadow: `0 1px 2px 0 ${COLORS.palette.hex_000000_025}`,
            }}
          >
            <img
              src={filter.icon}
              alt=""
              style={{ width: '24px', height: '24px' }}
            />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

FilterTabs.propTypes = {
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
};

FilterTabs.defaultProps = {
  activeFilter: null,
};
