import PropTypes from 'prop-types';
import { COLORS } from '../../constants/colors.js';
import menuIcon from '../../assets/img/Symbol.png';
import bellIcon from '../../assets/img/iconoir_bell-notification-solid.svg';
import settingsIcon from '../../assets/img/uiw_setting.svg';

const SIDEBAR_ITEMS = [
  { id: 'menu', iconType: 'menu', label: '' },
  { id: 'notifications', icon: bellIcon, label: 'Thông báo' },
  { id: 'recent', iconType: 'recent', label: 'Gần đây' },
  { id: 'settings', icon: settingsIcon, label: 'Cài đặt', isBottom: true },
];

function renderIcon(item, isActive) {
  const iconColor = isActive
    ? COLORS.palette.hex_1a73e8_100
    : COLORS.palette.hex_4b5563_100;

  if (item.iconType === 'menu') {
    return (
      <img
        src={menuIcon}
        alt=""
        style={{ width: '20px', height: '20px' }}
      />
    );
  }

  if (item.iconType === 'recent') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill={iconColor}
          d="M12 4a8 8 0 1 1-7.37 4.88 1 1 0 0 1 1.84-.79A6 6 0 1 0 12 6a1 1 0 0 1 0-2Zm-1 3a1 1 0 0 1 1 1v4.17l2.59 2.58a1 1 0 1 1-1.42 1.42l-2.88-2.88A1 1 0 0 1 10 13V8a1 1 0 0 1 1-1Z"
        />
      </svg>
    );
  }

  return (
    <img
      src={item.icon}
      alt=""
      style={{
        width: '20px',
        height: '20px',
        filter: isActive
          ? 'brightness(0) saturate(100%) invert(28%) sepia(59%) saturate(2247%) hue-rotate(201deg) brightness(96%) contrast(93%)'
          : 'grayscale(100%)',
      }}
    />
  );
}

export function Sidebar({ activePage, onNavigate }) {
  return (
    <aside
      style={{
        width: '60px',
        height: '100vh',
        background: COLORS.neutral.surface,
        borderRight: `1px solid ${COLORS.palette.hex_d9dde9_100}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: '14px',
      }}
    >
      {SIDEBAR_ITEMS.map((item) => {
        const isActive = activePage === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-label={item.label || item.id}
            style={{
              marginTop: item.isBottom ? 'auto' : undefined,
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                gap: '6px',
              }}
            >
              {renderIcon(item, isActive)}
              {item.label ? (
                <span
                  style={{
                    fontSize: '10px',
                    lineHeight: '12px',
                    color: COLORS.palette.hex_6b7280_100,
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  {item.label}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </aside>
  );
}

Sidebar.propTypes = {
  activePage: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  activePage: 'menu',
};
