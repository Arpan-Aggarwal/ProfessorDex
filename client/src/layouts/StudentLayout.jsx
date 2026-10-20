import {
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  GraduationCap,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useStudentAuth,
} from "../context/StudentAuthContext";


export default function StudentLayout() {
  const {
    student,
    logout,
  } = useStudentAuth();

  const {
    semesterSlug,
  } = useParams();

  const navigate =
    useNavigate();

    function handlePointerMove(event) {
    // Touch devices don't need a cursor-following effect.
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty("--pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}%`);
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.setProperty("--pointer-x", "50%");
    event.currentTarget.style.setProperty("--pointer-y", "25%");
  }
  async function handleLogout() {
    await logout();

    navigate(
      `/rate/${semesterSlug}`,
      {
        replace: true,
      }
    );
  }


  return (
    <div
  className="student-shell"
  onPointerMove={handlePointerMove}
  onPointerLeave={handlePointerLeave}
>

      <div className="student-atmosphere student-atmosphere-one" />
      <div className="student-atmosphere student-atmosphere-two" />


      <header className="student-header">

        {/* =====================================
            BRAND
            ===================================== */}

        <button
          className="student-brand"
          onClick={() =>
            navigate(
              `/rate/${semesterSlug}/dex`
            )
          }
        >

          <div className="student-brand-icon">

            <GraduationCap
              size={24}
            />

          </div>


          <div>

            <strong>
              Professor<span>Dex</span>
            </strong>

            <small>
              Faculty Collection Portal
            </small>

          </div>

        </button>


        {/* =====================================
            HEADER STATUS
            ===================================== */}

        <div className="student-header-right">


          {/* Semester */}

          <div className="student-semester-pill">

            <Sparkles
              size={14}
            />

            {
              student?.semester
                ?.name
            }

          </div>


          {/* Rating Gate */}

          <div
            className={
              student?.semester
                ?.ratingsOpen
                ? "student-gate-pill open"
                : "student-gate-pill closed"
            }
          >

            <span className="student-gate-dot" />

            {student?.semester
              ?.ratingsOpen
              ? "Ratings Open"
              : "Ratings Closed"}

          </div>


          {/* Privacy */}

          <div className="student-privacy-pill">

            <ShieldCheck
              size={14}
            />

            Anonymous Rating

          </div>


          {/* Logout */}

          <button
            className="student-logout"
            onClick={
              handleLogout
            }
            title="Logout"
          >

            <LogOut
              size={17}
            />

          </button>

        </div>

      </header>


      {/* =====================================
          PAGE CONTENT
          ===================================== */}

      <main className="student-main">

        <Outlet />

      </main>

    </div>
  );
}