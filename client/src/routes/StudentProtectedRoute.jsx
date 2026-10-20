import {
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";

import {
  useStudentAuth,
} from "../context/StudentAuthContext";


const VALID_SEMESTERS = new Set([
  "applied-dept-1",
  "applied-dept-2",
  "cse-2nd",
  "cse-3rd",
  "aiml-2nd",
  "aiml-3rd",
  "mechanical",
  "biotech",
  "ar",
  "ece",
  "bba",
]);


const PORTAL_AUTH_KEY =
  "professordexPortalAuth";


export default function StudentProtectedRoute() {
  const {
    student,
    loading,
  } = useStudentAuth();

  const {
    semesterSlug,
  } = useParams();


  if (
    !VALID_SEMESTERS.has(
      semesterSlug
    )
  ) {
    return (
      <Navigate
        to="/rate/applied-dept-1"
        replace
      />
    );
  }


  if (loading) {
    return (
      <div className="student-loading-page">

        <div className="student-loading-orb">
          PD
        </div>

        <p>
          Opening your ProfessorDex
          portal...
        </p>

      </div>
    );
  }


  const portalAuth =
    sessionStorage.getItem(
      PORTAL_AUTH_KEY
    );


  if (
    !student ||
    portalAuth !==
      semesterSlug
  ) {
    return (
      <Navigate
        to={`/rate/${semesterSlug}/login`}
        replace
      />
    );
  }


  if (
    student.semester?.slug !==
    semesterSlug
  ) {
    sessionStorage.removeItem(
      PORTAL_AUTH_KEY
    );

    return (
      <Navigate
        to={`/rate/${semesterSlug}/login`}
        replace
      />
    );
  }


  return <Outlet />;
}