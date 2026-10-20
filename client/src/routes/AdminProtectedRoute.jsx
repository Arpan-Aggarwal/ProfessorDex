import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAdminAuth,
} from "../context/AdminAuthContext";

export default function AdminProtectedRoute() {
  const {
    admin,
    loading,
  } = useAdminAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-sigil">
          PD
        </div>

        <p>
          Awakening ProfessorDex...
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Outlet />;
}