import PropTypes from 'prop-types';
import { COLORS } from '../../constants/colors.js';

const PRIORITY_STYLE = {
  critical: {
    text: 'Nguy cấp',
    background: COLORS.palette.hex_ff3b30_100,
    color: COLORS.neutral.surface,
  },
  high: {
    text: 'Cao',
    background: COLORS.palette.hex_ff8852_100,
    color: COLORS.neutral.surface,
  },
  medium: {
    text: 'Trung bình',
    background: COLORS.palette.hex_ffad59_100,
    color: COLORS.neutral.surface,
  },
  low: {
    text: 'Thap',
    background: COLORS.palette.hex_d9dde9_100,
    color: COLORS.palette.hex_313a51_100,
  },
};

export function PriorityBadge({ label }) {
  const styles = PRIORITY_STYLE[label] || PRIORITY_STYLE.low;

  return (
    <span
      style={{
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        background: styles.background,
        color: styles.color,
      }}
    >
      {styles.text}
    </span>
  );
}

PriorityBadge.propTypes = {
  label: PropTypes.string,
};

PriorityBadge.defaultProps = {
  label: 'low',
};
