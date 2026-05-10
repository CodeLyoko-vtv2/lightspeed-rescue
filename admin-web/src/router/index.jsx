import PropTypes from 'prop-types';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
