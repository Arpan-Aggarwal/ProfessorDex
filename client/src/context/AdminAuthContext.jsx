import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/http";

const AdminAuthContext =
  createContext(null);

export function AdminAuthProvider({
  children,
}) {
  const [admin, setAdmin] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  async function refreshAdmin() {
    try {
      const response =
        await api.get(
          "/auth/admin/me"
        );

      setAdmin(
        response.data.admin
      );
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAdmin();
  }, []);

  async function login(
    email,
    password
  ) {
    const response =
      await api.post(
        "/auth/admin/login",
        {
          email,
          password,
        }
      );

    setAdmin(
      response.data.admin
    );

    return response.data;
  }

  async function logout() {
    try {
      await api.post(
        "/auth/admin/logout"
      );
    } finally {
      setAdmin(null);
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        refreshAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context =
    useContext(
      AdminAuthContext
    );

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider"
    );
  }

  return context;
}