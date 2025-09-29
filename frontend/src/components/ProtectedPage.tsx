import type { JSX, FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface IProtectedPageProps {
   children: JSX.Element;
   roles?: ('engineer' | 'manager' | 'lead' | 'admin')[];
}

const ProtectedPage: FC<IProtectedPageProps> = ({ children, roles }) => {
   const { isAuthenticated, hasAnyRole } = useAuth();
   const location = useLocation();

   if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
   }

   if (roles && !hasAnyRole(roles)) {
      return <Navigate to="/403" replace />;
   }

   return children;
};

export default ProtectedPage;
