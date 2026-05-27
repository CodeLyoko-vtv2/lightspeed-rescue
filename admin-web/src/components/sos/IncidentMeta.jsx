import PropTypes from 'prop-types';

export function IncidentBadge({ incident, compact }) {
  if (!incident) return null;

  return (
    <span style={compact ? compactBadgeStyle : badgeStyle}>
      <span style={{ ...iconWrapStyle, background: incident.soft, color: incident.color }}>
        <IncidentIcon type={incident.icon} />
      </span>
      <span>{incident.label}</span>
    </span>
  );
}

function IncidentIcon({ type }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': 'true',
  };

  if (type === 'fire') {
    return <svg {...common}><path d="M13.5 2.5c.4 3.2-1.8 4.5-3.4 6.2C8.8 10 8 11.3 8 13.2a4 4 0 0 0 8 0c0-1.6-.7-2.8-1.9-4.1.2 1.5-.5 2.6-1.6 3.2.4-2.9-1.2-4.8-3-6.6C8.1 8.9 5 10.8 5 15a7 7 0 0 0 14 0c0-4.4-3.6-7-5.5-12.5Z" /></svg>;
  }
  if (type === 'nuclear') {
    return <svg {...common}><path d="M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm1-8v6.1a4.1 4.1 0 0 1 2.2 1.3l5.3-3.1A10 10 0 0 0 13 2Zm-2 0a10 10 0 0 0-7.5 4.3l5.3 3.1A4.1 4.1 0 0 1 11 8.1V2Zm5.2 9.1a4.2 4.2 0 0 1-.2 2.8l5.3 3.1A10 10 0 0 0 21 8l-4.8 3.1ZM8 13.9a4.2 4.2 0 0 1-.2-2.8L3 8a10 10 0 0 0-.3 9L8 13.9Zm1.2 1.7-5.3 3.1A10 10 0 0 0 12 22a10 10 0 0 0 8.1-3.3l-5.3-3.1a4.2 4.2 0 0 1-5.6 0Z" /></svg>;
  }
  if (type === 'earthquake') {
    return <svg {...common}><path d="M4 20 8.5 3h3L9 10h4l-2 5h4l-1.5 5H4Zm11.5 0L17 15h-3l2-5h-3l2.5-7H20l-3 9h3l-2 8h-2.5Z" /></svg>;
  }
  if (type === 'virus') {
    return <svg {...common}><path d="M11 2h2v3.1a7 7 0 0 1 2 .8l2.2-2.2 1.4 1.4-2.2 2.2a7 7 0 0 1 .8 2H20v2h-2.9a7 7 0 0 1-.8 2l2.2 2.2-1.4 1.4-2.2-2.2a7 7 0 0 1-2 .8V22h-2v-3.1a7 7 0 0 1-2-.8l-2.2 2.2-1.4-1.4 2.2-2.2a7 7 0 0 1-.8-2H2v-2h3.1a7 7 0 0 1 .8-2L3.7 5.1l1.4-1.4 2.2 2.2a7 7 0 0 1 2-.8V2Zm1 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm8 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" /></svg>;
  }
  if (type === 'flood') {
    return <svg {...common}><path d="M12 3c3 3 6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 3-7 6-10Zm-7 15c1.7 0 1.7-1 3.4-1s1.7 1 3.4 1 1.7-1 3.4-1 1.7 1 3.4 1V20c-1.7 0-1.7-1-3.4-1s-1.7 1-3.4 1-1.7-1-3.4-1S6.7 20 5 20v-2Z" /></svg>;
  }
  return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm0 9h2v2h-2v-2Z" /></svg>;
}

IncidentBadge.propTypes = {
  incident: PropTypes.shape({
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    soft: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }),
  compact: PropTypes.bool,
};

IncidentBadge.defaultProps = {
  incident: null,
  compact: false,
};

IncidentIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: '#111111',
  fontSize: '12px',
  fontWeight: 700,
};

const compactBadgeStyle = {
  ...badgeStyle,
  gap: '6px',
  fontSize: '11px',
};

const iconWrapStyle = {
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
};
