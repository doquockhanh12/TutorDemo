import { Link, Navigate, useLocation } from 'react-router-dom';
import useDemoAuth from './DemoAuthContext.jsx';
import { authPath, defaultDestination, safeRedirect } from './authUtils.js';

export function AuthLink({ to, children, ...props }) {
  const { authenticated } = useDemoAuth();
  const destination = authenticated ? to : authPath('/login', to);
  return <Link to={destination} {...props}>{children}</Link>;
}

export function ProtectedRoute({ children, role }) {
  const { user, authenticated } = useDemoAuth();
  const location = useLocation();
  if (!authenticated) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={authPath('/login', target)} replace state={{ from: target }} />;
  }
  if (role && user.role !== role) return <Navigate to={defaultDestination(user.role)} replace />;
  return children;
}

export function authSuccessTarget(search, role) {
  const redirect = new URLSearchParams(search).get('redirect');
  return safeRedirect(redirect) || defaultDestination(role);
}
