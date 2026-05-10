import PropTypes from 'prop-types';

export function AuthLayout({ leftPanel, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-left">
        {leftPanel}
      </div>
      <div className="auth-right">
        {children}
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  leftPanel: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};
