import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  ChevronRight,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  School,
  Crown,
} from "lucide-react";

import {
  useAdminAuth,
} from "../context/AdminAuthContext";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },

  {
    label: "Professors",
    path: "/admin/professors",
    icon: GraduationCap,
  },

  {
    label: "Private Codes",
    path: "/admin/codes",
    icon: KeyRound,
  },

  {
    label: "Rating Control",
    path: "/admin/ratings",
    icon: SlidersHorizontal,
  },

  {
    label: "Card Forge",
    path: "/admin/cards",
    icon: Sparkles,
  },
  {
  label: "School Event",
  path: "/admin/school-event",
  icon: School,
},
{
  label: "Hall of Legends",
  path: "/admin/school-legends",
  icon: Crown,
},
];

export default function AdminLayout() {
  const {
    admin,
    logout,
  } = useAdminAuth();

  const navigate =
    useNavigate();

  async function handleLogout() {
    await logout();

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );
  }

  return (
    <div className="admin-shell">
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />

      <aside className="admin-sidebar">
        <div className="brand">
          <div className="brand-sigil">
            P
          </div>

          <div>
            <div className="brand-title">
              ProfessorDex
            </div>

            <div className="brand-subtitle">
              Arcane Faculty Archive
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-label">
            Control Room
          </div>

          {navigation.map(
            ({
              label,
              path,
              icon: Icon,
              end,
            }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({
                  isActive,
                }) =>
                  `nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                />

                <span>
                  {label}
                </span>

                <ChevronRight
                  className="nav-arrow"
                  size={15}
                />
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              <ShieldCheck
                size={19}
              />
            </div>

            <div className="admin-profile-copy">
              <strong>
                Administrator
              </strong>

              <span>
                {admin?.email}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}