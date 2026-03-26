import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = () => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-navy-dark">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-medium">A verificar permissões...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin') {
        // Redireciona utilizadores comuns para a home se tentarem aceder ao admin
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
