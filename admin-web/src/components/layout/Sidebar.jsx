import PropTypes from 'prop-types';
import { COLORS } from '../../constants/colors.js';
import menuIcon from '../../assets/img/Symbol.png';
import bellIcon from '../../assets/img/iconoir_bell-notification-solid.svg';
import settingsIcon from '../../assets/img/uiw_setting.svg';

const SIDEBAR_ITEMS = [
  { id: 'menu', iconType: 'menu', label: '' },
  { id: 'teams', iconType: 'teams', label: 'Đội cứu hộ' },
  { id: 'notifications', icon: bellIcon, label: 'Thông báo' },
  { id: 'recent', iconType: 'recent', label: 'Gần đây' },
  { id: 'settings', icon: settingsIcon, label: 'Cài đặt', isBottom: true },
  { id: 'logout', iconType: 'logout', label: 'Đăng xuất' },
];

function renderIcon(item, isActive) {
  const iconColor = isActive
    ? COLORS.palette.hex_1a73e8_100
    : COLORS.palette.hex_4b5563_100;

  if (item.iconType === 'menu') {
    return <img src={menuIcon} alt="" style={{ width: '20px', height: '20px' }} />;
  }

  if (item.iconType === 'teams') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill={iconColor}
          d="M16 11a4 4 0 1 0-3.46-6A4 4 0 0 0 8 11a6 6 0 0 0-6 6v1a2 2 0 0 0 2 2h8.25A6.96 6.96 0 0 1 11 16c0-1.02.22-1.99.62-2.86A5.96 5.96 0 0 0 8 11Zm0 2a5 5 0 0 0-5 5v1a1 1 0 0 0 1 1h8a2 2 0 0 0 2-2 5 5 0 0 0-6-5Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        />
      </svg>
    );
  }

  if (item.iconType === 'recent') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill={iconColor}
          d="M12 4a8 8 0 1 1-7.37 4.88 1 1 0 0 1 1.84-.79A6 6 0 1 0 12 6a1 1 0 0 1 0-2Zm-1 3a1 1 0 0 1 1 1v4.17l2.59 2.58a1 1 0 1 1-1.42 1.42l-2.88-2.88A1 1 0 0 1 10 13V8a1 1 0 0 1 1-1Z"
        />
      </svg>
    );
  }

  if (item.iconType === 'logout') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill={iconColor}
          d="M5 4a2 2 0 0 1 2-2h5a1 1 0 1 1 0 2H7v16h5a1 1 0 1 1 0 2H7a2 2 0 0 1-2-2V4Zm11.3 4.3a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 1 1-1.4-1.4l1.29-1.3H11a1 1 0 1 1 0-2h6.59l-1.3-1.3a1 1 0 0 1 0-1.4Z"
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
            title={item.label || item.id}
            style={{
              marginTop: item.isBottom ? 'auto' : undefined,
              width: '40px',
              minHeight: item.label ? '48px' : '40px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{ display: 'grid', placeItems: 'center', gap: '4px' }}>
              {renderIcon(item, isActive)}
              {item.label ? (
                <span
                  style={{
                    fontSize: '9px',
                    lineHeight: '11px',
                    color: COLORS.palette.hex_6b7280_100,
                    fontFamily: 'Roboto, sans-serif',
                    textAlign: 'center',
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
