import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Activity,
  GraduationCap,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";

import api from "../../api/http";

const cardMotion = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: (
    index
  ) => ({
    opacity: 1,
    y: 0,

    transition: {
      delay:
        index * 0.06,
      duration: 0.4,
    },
  }),
};

export default function AdminDashboard() {
  const [
    overview,
    setOverview,
  ] = useState({
    professors: 0,
    semesters: 0,
    openSemesters: 0,
    totalRatings: 0,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [
          teacherResponse,
          semesterResponse,
        ] =
          await Promise.all([
            api.get(
              "/admin/teachers"
            ),

            api.get(
              "/admin/ratings/semesters"
            ),
          ]);

        const teachers =
          teacherResponse.data
            .teachers ??
          teacherResponse.data ??
          [];

        const semesters =
          semesterResponse.data
            .semesters ?? [];

        setOverview({
          professors:
            teachers.length,

          semesters:
            semesters.length,

          openSemesters:
            semesters.filter(
              (semester) =>
                semester.ratingsOpen
            ).length,

          totalRatings:
            semesters.reduce(
              (
                total,
                semester
              ) =>
                total +
                (
                  semester._count
                    ?.ratings ?? 0
                ),
              0
            ),
        });
      } catch (error) {
        console.error(
          "Dashboard load error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const metrics = [
    {
      label:
        "Active Professors",

      value:
        overview.professors,

      icon:
        GraduationCap,

      caption:
        "Faculty profiles inside the archive",
    },

    {
      label:
        "Registered Semesters",

      value:
        overview.semesters,

      icon:
        Users,

      caption:
        "Student rating realms configured",
    },

    {
      label:
        "Open Rating Windows",

      value:
        overview.openSemesters,

      icon:
        Radio,

      caption:
        "Semesters currently accepting ratings",
    },

    {
      label:
        "Anonymous Ratings",

      value:
        overview.totalRatings,

      icon:
        Activity,

      caption:
        "Responses gathered across ProfessorDex",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <div className="eyebrow">
            <Sparkles
              size={14}
            />

            ARCANE CONTROL
            ROOM
          </div>

          <h1>
            The Archive is
            awake.
          </h1>

          <p>
            Manage professors,
            rating cycles and card
            creation from one place.
          </p>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          Systems Online
        </div>
      </header>

      <section className="metric-grid">
        {metrics.map(
          (
            metric,
            index
          ) => {
            const Icon =
              metric.icon;

            return (
              <motion.article
                key={
                  metric.label
                }
                className="metric-card"
                custom={index}
                variants={
                  cardMotion
                }
                initial="hidden"
                animate="visible"
              >
                <div className="metric-top">
                  <div className="metric-icon">
                    <Icon
                      size={20}
                    />
                  </div>

                  <span>
                    0
                    {index + 1}
                  </span>
                </div>

                <div className="metric-value">
                  {loading
                    ? "—"
                    : metric.value}
                </div>

                <h3>
                  {metric.label}
                </h3>

                <p>
                  {metric.caption}
                </p>
              </motion.article>
            );
          }
        )}
      </section>

      <section className="dashboard-panels">
        <div className="dashboard-panel wide-panel">
          <div className="panel-header">
            <div>
              <span>
                WORKFLOW
              </span>

              <h2>
                ProfessorDex
                Forge
              </h2>
            </div>

            <Sparkles
              size={19}
            />
          </div>

          <div className="workflow">
            <div className="workflow-step active">
              <span>
                01
              </span>

              <strong>
                Collect
              </strong>

              <p>
                Anonymous semester
                ratings
              </p>
            </div>

            <div className="workflow-line" />

            <div className="workflow-step">
              <span>
                02
              </span>

              <strong>
                Distill
              </strong>

              <p>
                Final stats and
                titles
              </p>
            </div>

            <div className="workflow-line" />

            <div className="workflow-step">
              <span>
                03
              </span>

              <strong>
                Awaken
              </strong>

              <p>
                Archetype and
                special move
              </p>
            </div>

            <div className="workflow-line" />

            <div className="workflow-step">
              <span>
                04
              </span>

              <strong>
                Forge
              </strong>

              <p>
                Official professor
                card
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-panel sigil-panel">
          <div className="sigil-ring">
            <div className="sigil-core">
              PD
            </div>
          </div>

          <strong>
            ProfessorDex Engine
          </strong>

          <p>
            Ratings remain separate
            from student identity.
          </p>
        </div>
      </section>
    </div>
  );
}