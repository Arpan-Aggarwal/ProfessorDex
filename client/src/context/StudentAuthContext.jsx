import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/http";


const StudentAuthContext =
  createContext(null);


const PORTAL_AUTH_KEY =
  "professordexPortalAuth";


export function StudentAuthProvider({
  children,
}) {
  const [
    student,
    setStudent,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  async function refreshStudent() {
    try {
      const response =
        await api.get(
          "/auth/student/me"
        );

      setStudent(
        response.data.student
      );

      return response.data
        .student;

    } catch {
      setStudent(null);

      return null;

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    refreshStudent();
  }, []);


  async function register({
    email,
    password,
    privateCode,
    semesterSlug,
  }) {
    const response =
      await api.post(
        "/auth/student/register",
        {
          email,
          password,
          privateCode,
          semesterSlug,
        }
      );

    const registeredStudent =
      response.data.student;

    setStudent(
      registeredStudent
    );


    if (
      registeredStudent
        ?.semester?.slug ===
      semesterSlug
    ) {
      sessionStorage.setItem(
        PORTAL_AUTH_KEY,
        semesterSlug
      );
    } else {
      sessionStorage.removeItem(
        PORTAL_AUTH_KEY
      );
    }


    return response.data;
  }


  async function login(
    email,
    password,
    semesterSlug
  ) {
    const response =
      await api.post(
        "/auth/student/login",
        {
          email,
          password,
        }
      );

    const loggedInStudent =
      response.data.student;

    setStudent(
      loggedInStudent
    );


    if (
      loggedInStudent
        ?.semester?.slug ===
      semesterSlug
    ) {
      sessionStorage.setItem(
        PORTAL_AUTH_KEY,
        semesterSlug
      );
    } else {
      sessionStorage.removeItem(
        PORTAL_AUTH_KEY
      );
    }


    return response.data;
  }


  async function logout() {
    try {
      await api.post(
        "/auth/student/logout"
      );

    } finally {
      sessionStorage.removeItem(
        PORTAL_AUTH_KEY
      );

      setStudent(null);
    }
  }


  return (
    <StudentAuthContext.Provider
      value={{
        student,
        loading,
        register,
        login,
        logout,
        refreshStudent,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}


export function useStudentAuth() {
  const context =
    useContext(
      StudentAuthContext
    );

  if (!context) {
    throw new Error(
      "useStudentAuth must be used inside StudentAuthProvider"
    );
  }

  return context;
}