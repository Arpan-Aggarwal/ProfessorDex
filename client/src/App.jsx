import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import SchoolEventRating from "./pages/school/SchoolEventRating";
// ADMIN
import SchoolHallOfLegends from "./pages/admin/SchoolHallOfLegends";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfessorArchive from "./pages/admin/ProfessorArchive";
import PrivateCodes from "./pages/admin/PrivateCodes";
import RatingControl from "./pages/admin/RatingControl";
import CardForge from "./pages/admin/CardForge";
import SchoolEventManager from "./pages/admin/SchoolEventManager";

// STUDENT

import StudentProtectedRoute from "./routes/StudentProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";

import StudentWelcome from "./pages/student/StudentWelcome";
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import FacultyCollection from "./pages/student/FacultyCollection";
import ProfessorRating from "./pages/student/ProfessorRating";


export default function App() {
  return (
    <Routes>


      {/* =====================================
          ROOT
          ===================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/admin"
            replace
          />
        }
      />


      {/* =====================================
          ADMIN
          ===================================== */}

      <Route
        path="/admin/login"
        element={
          <AdminLogin />
        }
      />


      <Route
        element={
          <AdminProtectedRoute />
        }
      >

        <Route
          path="/admin"
          element={
            <AdminLayout />
          }
        >

          <Route
            index
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="professors"
            element={
              <ProfessorArchive />
            }
          />

          <Route
            path="codes"
            element={
              <PrivateCodes />
            }
          />

          <Route
            path="ratings"
            element={
              <RatingControl />
            }
          />

          <Route
            path="cards"
            element={
              <CardForge />
            }
          />
        <Route
        path="school-event"
        element={<SchoolEventManager />}
      />
            <Route
          path="school-legends"
          element={<SchoolHallOfLegends />}
        />
        </Route>

      </Route>


      {/* =====================================
          STUDENT PUBLIC
          ===================================== */}

      <Route
        path="/rate/:semesterSlug"
        element={
          <StudentWelcome />
        }
      />


      <Route
        path="/rate/:semesterSlug/login"
        element={
          <StudentLogin />
        }
      />


      <Route
        path="/rate/:semesterSlug/register"
        element={
          <StudentRegister />
        }
      />


      {/* =====================================
          STUDENT PROTECTED
          ===================================== */}

      <Route
        path="/rate/:semesterSlug"
        element={
          <StudentProtectedRoute />
        }
      >

        <Route
          path="dex"
          element={
            <StudentLayout />
          }
        >

          <Route
            index
            element={
              <FacultyCollection />
            }
          />
 
          <Route
            path="rate/:teacherId"
            element={
              <ProfessorRating />
            }
          />

        </Route>

      </Route>
      {/* =====================================
    SCHOOL EVENT — PUBLIC RATING
    ===================================== */}

<Route
  path="/school-event"
  element={<SchoolEventRating />}
/>

      {/* =====================================
          FALLBACK
          ===================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/admin"
            replace
          />
        }
      />

    </Routes>
  );
}