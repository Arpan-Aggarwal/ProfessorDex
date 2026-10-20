import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Lock,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Unlock,
  Users,
  X,
} from "lucide-react";

import api from "../../api/http";


function getSemesterIds(
  teacher
) {
  return (
    teacher?.semesters
      ?.map((item) => {
        if (
          item.semesterId
        ) {
          return item.semesterId;
        }

        if (
          item.semester?.id
        ) {
          return item.semester.id;
        }

        return null;
      })
      .filter(Boolean) ?? []
  );
}


function getSemesterNames(
  teacher
) {
  return (
    teacher?.semesters
      ?.map((item) => {
        if (
          item.semester?.name
        ) {
          return item.semester.name;
        }

        if (item.name) {
          return item.name;
        }

        return null;
      })
      .filter(Boolean) ?? []
  );
}


const statDefinitions = [
  {
    key: "teachingAura",
    label: "Teaching Aura",
    finalKey:
      "finalTeachingAura",
    titleKey:
      "teachingAuraTitle",
  },

  {
    key: "humourMeter",
    label: "Humour Meter",
    finalKey:
      "finalHumourMeter",
    titleKey:
      "humourMeterTitle",
  },

  {
    key: "classroomVibe",
    label: "Classroom Vibe",
    finalKey:
      "finalClassroomVibe",
    titleKey:
      "classroomVibeTitle",
  },

  {
    key: "mentorEnergy",
    label: "Mentor Energy",
    finalKey:
      "finalMentorEnergy",
    titleKey:
      "mentorEnergyTitle",
  },

  {
    key: "classroomPresence",
    label:
      "Classroom Presence",
    finalKey:
      "finalClassroomPresence",
    titleKey:
      "classroomPresenceTitle",
  },
];


export default function RatingControl() {
  const [
    semesters,
    setSemesters,
  ] = useState([]);

  const [
    teachers,
    setTeachers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    semesterBusy,
    setSemesterBusy,
  ] = useState(null);

  const [
    selectedTeacher,
    setSelectedTeacher,
  ] = useState(null);

  const [
    statsPreview,
    setStatsPreview,
  ] = useState(null);

  const [
    statsLoading,
    setStatsLoading,
  ] = useState(false);

  const [
    statsModalOpen,
    setStatsModalOpen,
  ] = useState(false);

  const [
    finalizing,
    setFinalizing,
  ] = useState(false);

  const [
    modalError,
    setModalError,
  ] = useState("");

  const [
    finalStats,
    setFinalStats,
  ] = useState({});


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        semesterResponse,
        teacherResponse,
      ] = await Promise.all([
        api.get(
          "/admin/ratings/semesters"
        ),

        api.get(
          "/admin/ratings/stats/teachers"
        ),
      ]);

      setSemesters(
        semesterResponse.data
          .semesters ?? []
      );

      setTeachers(
        teacherResponse.data
          .teachers ?? []
      );

    } catch (err) {
      console.error(
        "Rating control load error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          "Unable to load rating controls."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  const openSemesterCount =
    semesters.filter(
      (semester) =>
        semester.ratingsOpen
    ).length;


  const totalRatings =
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
    );


  const totalStudents =
    semesters.reduce(
      (
        total,
        semester
      ) =>
        total +
        (
          semester._count
            ?.students ?? 0
        ),
      0
    );


  const finalizedCount =
    teachers.filter(
      (teacher) =>
        teacher.statsFinalized
    ).length;


  const filteredTeachers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return teachers.filter(
        (teacher) => {
          const queryMatch =
            !query ||
            teacher.name
              ?.toLowerCase()
              .includes(query) ||
            teacher.department
              ?.toLowerCase()
              .includes(query);

          const statusMatch =
            statusFilter === "all" ||
            (
              statusFilter ===
              "finalized"
                ? teacher.statsFinalized
                : !teacher.statsFinalized
            );

          return (
            queryMatch &&
            statusMatch
          );
        }
      );
    }, [
      teachers,
      search,
      statusFilter,
    ]);


  async function toggleSemester(
    semester
  ) {
    try {
      setSemesterBusy(
        semester.id
      );

      await api.patch(
        `/admin/ratings/semesters/${semester.id}`,
        {
          ratingsOpen:
            !semester.ratingsOpen,
        }
      );

      await loadData();

    } catch (err) {
      window.alert(
        err?.response?.data
          ?.message ||
          "Unable to change rating status."
      );

    } finally {
      setSemesterBusy(null);
    }
  }


  function buildEditableStats(
    preview,
    finalizedTeacher
  ) {
    const result = {};

    for (
      const definition
      of statDefinitions
    ) {
      const previewStat =
        preview?.stats?.[
          definition.key
        ];

      const finalizedScore =
        finalizedTeacher?.[
          definition.finalKey
        ];

      const finalizedTitle =
        finalizedTeacher?.[
          definition.titleKey
        ];

      result[
        definition.key
      ] = {
        score:
          finalizedScore ??
          previewStat?.score ??
          0,

        title:
          finalizedTitle ??
          previewStat
            ?.suggestedTitle
            ?.title ??
          "",
      };
    }

    return result;
  }


  async function openStatsReview(
    teacher
  ) {
    setSelectedTeacher(
      teacher
    );

    setStatsPreview(null);

    setModalError("");

    setStatsModalOpen(true);

    setStatsLoading(true);

    try {
      const previewResponse =
        await api.get(
          `/admin/ratings/stats/teachers/${teacher.id}`
        );

      const preview =
        previewResponse.data;

      let finalizedTeacher =
        null;

      if (
        teacher.statsFinalized
      ) {
        try {
          const finalizedResponse =
            await api.get(
              `/admin/ratings/stats/teachers/${teacher.id}/finalized`
            );

          finalizedTeacher =
            finalizedResponse.data
              .teacher;
        } catch {
          finalizedTeacher =
            null;
        }
      }

      setStatsPreview(
        preview
      );

      setFinalStats(
        buildEditableStats(
          preview,
          finalizedTeacher
        )
      );

    } catch (err) {
      console.error(
        "Stats review error:",
        err
      );

      setModalError(
        err?.response?.data
          ?.message ||
          "Unable to load professor stats."
      );

    } finally {
      setStatsLoading(false);
    }
  }


  function closeStatsModal() {
    if (finalizing) {
      return;
    }

    setStatsModalOpen(
      false
    );

    setTimeout(() => {
      setSelectedTeacher(
        null
      );

      setStatsPreview(
        null
      );

      setFinalStats({});

      setModalError("");
    }, 220);
  }


  function updateScore(
    key,
    value
  ) {
    let numericValue =
      Number(value);

    if (
      Number.isNaN(
        numericValue
      )
    ) {
      numericValue = 0;
    }

    numericValue =
      Math.max(
        0,
        Math.min(
          100,
          numericValue
        )
      );

    setFinalStats(
      (current) => ({
        ...current,

        [key]: {
          ...current[key],

          score:
            numericValue,
        },
      })
    );
  }


  function updateTitle(
    key,
    value
  ) {
    setFinalStats(
      (current) => ({
        ...current,

        [key]: {
          ...current[key],

          title: value,
        },
      })
    );
  }


  function resetToSuggested() {
    if (!statsPreview) {
      return;
    }

    setFinalStats(
      buildEditableStats(
        statsPreview,
        null
      )
    );
  }


  const selectedSemesterIds =
    getSemesterIds(
      selectedTeacher
    );


  const assignedSemesters =
    semesters.filter(
      (semester) =>
        selectedSemesterIds.includes(
          semester.id
        )
    );


  const openAssignedSemesters =
    assignedSemesters.filter(
      (semester) =>
        semester.ratingsOpen
    );


  const canFinalize =
    statsPreview?.totalRatings >
      0 &&
    openAssignedSemesters.length ===
      0;


  async function finalizeStats() {
    if (
      !selectedTeacher ||
      !statsPreview?.stats
    ) {
      return;
    }


    const invalidTitle =
      statDefinitions.some(
        (definition) =>
          !finalStats[
            definition.key
          ]?.title?.trim()
      );


    if (invalidTitle) {
      setModalError(
        "Every stat needs a title before finalization."
      );

      return;
    }


    try {
      setFinalizing(true);

      setModalError("");

      await api.put(
        `/admin/ratings/stats/teachers/${selectedTeacher.id}/finalize`,
        {
          teachingAura:
            finalStats
              .teachingAura
              .score,

          humourMeter:
            finalStats
              .humourMeter
              .score,

          classroomVibe:
            finalStats
              .classroomVibe
              .score,

          mentorEnergy:
            finalStats
              .mentorEnergy
              .score,

          classroomPresence:
            finalStats
              .classroomPresence
              .score,

          teachingAuraTitle:
            finalStats
              .teachingAura
              .title
              .trim(),

          humourMeterTitle:
            finalStats
              .humourMeter
              .title
              .trim(),

          classroomVibeTitle:
            finalStats
              .classroomVibe
              .title
              .trim(),

          mentorEnergyTitle:
            finalStats
              .mentorEnergy
              .title
              .trim(),

          classroomPresenceTitle:
            finalStats
              .classroomPresence
              .title
              .trim(),
        }
      );


      await loadData();

      setSelectedTeacher(
        (current) => ({
          ...current,
          statsFinalized: true,
          finalizedAt:
            new Date()
              .toISOString(),
        })
      );


    } catch (err) {
      console.error(
        "Finalization error:",
        err
      );

      setModalError(
        err?.response?.data
          ?.message ||
          "Unable to finalize professor stats."
      );

    } finally {
      setFinalizing(false);
    }
  }


  return (
    <div className="rating-control-page">

      <header className="page-header">
        <div>
          <div className="eyebrow">
            <Sparkles
              size={14}
            />

            RATING CHAMBER
          </div>

          <h1>
            Rating Control
          </h1>

          <p>
            Control rating windows,
            inspect anonymous results,
            and distill professor
            stats.
          </p>
        </div>

        <button
          className="rating-refresh-button"
          onClick={
            loadData
          }
        >
          <RefreshCw
            size={15}
          />

          Refresh
        </button>
      </header>


      <section className="rating-overview-grid">

        <article className="rating-overview-card">
          <div className="rating-overview-icon">
            <Unlock size={19} />
          </div>

          <span>
            OPEN WINDOWS
          </span>

          <strong>
            {openSemesterCount}
          </strong>

          <p>
            Semesters accepting
            ratings.
          </p>
        </article>


        <article className="rating-overview-card">
          <div className="rating-overview-icon">
            <Activity size={19} />
          </div>

          <span>
            TOTAL RATINGS
          </span>

          <strong>
            {totalRatings}
          </strong>

          <p>
            Anonymous responses
            collected.
          </p>
        </article>


        <article className="rating-overview-card">
          <div className="rating-overview-icon">
            <Users size={19} />
          </div>

          <span>
            STUDENTS
          </span>

          <strong>
            {totalStudents}
          </strong>

          <p>
            Registered across all
            semesters.
          </p>
        </article>


        <article className="rating-overview-card">
          <div className="rating-overview-icon">
            <CheckCircle2
              size={19}
            />
          </div>

          <span>
            FINALIZED
          </span>

          <strong>
            {finalizedCount}
          </strong>

          <p>
            Professors ready for the
            Card Forge.
          </p>
        </article>

      </section>


      {error && (
        <div className="archive-error">
          {error}
        </div>
      )}


      <section className="semester-control-section">

        <div className="section-heading">

          <div>
            <span>
              RATING WINDOWS
            </span>

            <h2>
              Semester Gates
            </h2>

            <p>
              Open a gate to accept
              ratings. Close every
              assigned gate before
              finalizing a professor.
            </p>
          </div>

        </div>


        <div className="semester-gate-grid">

          {semesters.map(
            (
              semester,
              index
            ) => (
              <motion.article
                key={
                  semester.id
                }
                className={
                  semester.ratingsOpen
                    ? "semester-gate-card open"
                    : "semester-gate-card"
                }
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index *
                    0.04,
                }}
              >

                <div className="semester-gate-top">

                  <div
                    className={
                      semester.ratingsOpen
                        ? "gate-orb open"
                        : "gate-orb"
                    }
                  >
                    {semester.ratingsOpen ? (
                      <Unlock
                        size={18}
                      />
                    ) : (
                      <Lock
                        size={18}
                      />
                    )}
                  </div>


                  <span
                    className={
                      semester.ratingsOpen
                        ? "gate-state open"
                        : "gate-state"
                    }
                  >
                    {semester.ratingsOpen
                      ? "LIVE"
                      : "SEALED"}
                  </span>

                </div>


                <h3>
                  {semester.name}
                </h3>

                <span className="semester-slug">
                  {semester.slug}
                </span>


                <div className="semester-gate-stats">

                  <div>
                    <strong>
                      {
                        semester
                          ._count
                          ?.students ??
                        0
                      }
                    </strong>

                    <span>
                      Students
                    </span>
                  </div>


                  <div>
                    <strong>
                      {
                        semester
                          ._count
                          ?.teachers ??
                        0
                      }
                    </strong>

                    <span>
                      Faculty
                    </span>
                  </div>


                  <div>
                    <strong>
                      {
                        semester
                          ._count
                          ?.ratings ??
                        0
                      }
                    </strong>

                    <span>
                      Ratings
                    </span>
                  </div>

                </div>


                <button
                  className={
                    semester.ratingsOpen
                      ? "gate-toggle close-gate"
                      : "gate-toggle open-gate"
                  }
                  disabled={
                    semesterBusy ===
                    semester.id
                  }
                  onClick={() =>
                    toggleSemester(
                      semester
                    )
                  }
                >
                  {semesterBusy ===
                  semester.id
                    ? "Updating..."
                    : semester.ratingsOpen
                    ? "Seal Rating Gate"
                    : "Open Rating Gate"}
                </button>

              </motion.article>
            )
          )}

        </div>

      </section>


      <section className="stats-review-section">

        <div className="section-heading stats-heading">

          <div>
            <span>
              DISTILLATION
            </span>

            <h2>
              Professor Stats
            </h2>

            <p>
              Review calculated
              results before forging
              the final card profile.
            </p>
          </div>


          <div className="stats-toolbar">

            <div className="stats-search">
              <Search
                size={15}
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search professor..."
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                >
                  <X size={14} />
                </button>
              )}
            </div>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="all">
                All Professors
              </option>

              <option value="pending">
                Needs Finalization
              </option>

              <option value="finalized">
                Finalized
              </option>
            </select>

          </div>

        </div>


        {loading ? (
          <div className="stats-empty-state">
            <div className="archive-loading-sigil">
              PD
            </div>

            <p>
              Reading anonymous
              ratings...
            </p>
          </div>
        ) : filteredTeachers.length ===
          0 ? (
          <div className="stats-empty-state">
            <BarChart3
              size={28}
            />

            <h3>
              No professors found
            </h3>

            <p>
              There are no matching
              stats to review.
            </p>
          </div>
        ) : (
          <div className="stats-professor-grid">

            {filteredTeachers.map(
              (
                teacher,
                index
              ) => {

                const names =
                  getSemesterNames(
                    teacher
                  );

                const ratingCount =
                  teacher._count
                    ?.ratings ??
                  0;

                return (
                  <motion.article
                    className="stats-professor-card"
                    key={
                      teacher.id
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index *
                        0.035,
                    }}
                  >

                    <div className="stats-professor-top">

                      <div className="stats-professor-symbol">
                        <GraduationCap
                          size={19}
                        />
                      </div>


                      <span
                        className={
                          teacher.statsFinalized
                            ? "finalization-badge finalized"
                            : "finalization-badge"
                        }
                      >
                        {teacher.statsFinalized
                          ? "FINALIZED"
                          : "AWAITING"}
                      </span>

                    </div>


                    <h3>
                      {teacher.name}
                    </h3>

                    <p className="stats-department">
                      {
                        teacher.department
                      }
                    </p>


                    <div className="stats-semester-tags">
                      {names.map(
                        (name) => (
                          <span
                            key={
                              name
                            }
                          >
                            {name}
                          </span>
                        )
                      )}
                    </div>


                    <div className="stats-card-count">

                      <div>
                        <span>
                          ANONYMOUS RATINGS
                        </span>

                        <strong>
                          {ratingCount}
                        </strong>
                      </div>


                      <div>
                        <span>
                          STATUS
                        </span>

                        <strong>
                          {ratingCount > 0
                            ? "Data Ready"
                            : "No Data"}
                        </strong>
                      </div>

                    </div>


                    <button
                      className="review-stats-button"
                      onClick={() =>
                        openStatsReview(
                          teacher
                        )
                      }
                    >
                      <BarChart3
                        size={15}
                      />

                      {teacher.statsFinalized
                        ? "Review Final Stats"
                        : "Review & Finalize"}
                    </button>

                  </motion.article>
                );
              }
            )}

          </div>
        )}

      </section>


      <AnimatePresence>
        {statsModalOpen && (
          <motion.div
            className="faculty-modal-backdrop"

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            exit={{
              opacity: 0,
            }}

            onMouseDown={
              closeStatsModal
            }
          >

            <motion.div
              className="stats-review-modal"

              initial={{
                opacity: 0,
                scale: 0.97,
                y: 18,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.97,
                y: 10,
              }}

              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              <div className="stats-modal-header">

                <div>
                  <span>
                    STAT DISTILLATION
                  </span>

                  <h2>
                    {
                      selectedTeacher
                        ?.name
                    }
                  </h2>

                  <p>
                    {
                      selectedTeacher
                        ?.department
                    }
                  </p>
                </div>


                <button
                  onClick={
                    closeStatsModal
                  }
                >
                  <X size={18} />
                </button>

              </div>


              {statsLoading ? (
                <div className="stats-modal-loading">
                  <div className="archive-loading-sigil">
                    PD
                  </div>

                  <p>
                    Distilling professor
                    aura...
                  </p>
                </div>
              ) : modalError &&
                !statsPreview ? (
                <div className="stats-modal-loading">
                  <p className="stats-error-text">
                    {modalError}
                  </p>
                </div>
              ) : statsPreview ? (
                <>

                  <div className="stats-modal-summary">

                    <div>
                      <span>
                        RATINGS
                      </span>

                      <strong>
                        {
                          statsPreview
                            .totalRatings
                        }
                      </strong>
                    </div>


                    <div>
                      <span>
                        ASSIGNED
                      </span>

                      <strong>
                        {
                          assignedSemesters
                            .length
                        }
                        {" "}
                        Semesters
                      </strong>
                    </div>


                    <div>
                      <span>
                        FINALIZATION
                      </span>

                      <strong
                        className={
                          selectedTeacher
                            ?.statsFinalized
                            ? "summary-finalized"
                            : ""
                        }
                      >
                        {selectedTeacher
                          ?.statsFinalized
                          ? "Finalized"
                          : "Pending"}
                      </strong>
                    </div>

                  </div>


                  {openAssignedSemesters.length >
                    0 && (
                    <div className="stats-gate-warning">

                      <Unlock
                        size={18}
                      />

                      <div>
                        <strong>
                          Finalization locked
                        </strong>

                        <span>
                          Close rating gates
                          for:
                          {" "}
                          {openAssignedSemesters
                            .map(
                              (
                                semester
                              ) =>
                                semester.name
                            )
                            .join(
                              ", "
                            )}
                        </span>
                      </div>

                    </div>
                  )}


                  {statsPreview.totalRatings ===
                  0 ? (
                    <div className="no-rating-preview">

                      <BarChart3
                        size={31}
                      />

                      <h3>
                        No ratings yet
                      </h3>

                      <p>
                        This professor
                        needs at least one
                        anonymous rating
                        before stats can
                        be finalized.
                      </p>

                    </div>
                  ) : (
                    <div className="stat-editor-list">

                      {statDefinitions.map(
                        (
                          definition
                        ) => {

                          const calculated =
                            statsPreview
                              .stats?.[
                              definition
                                .key
                            ];

                          const editable =
                            finalStats[
                              definition
                                .key
                            ];

                          if (
                            !calculated ||
                            !editable
                          ) {
                            return null;
                          }


                          return (
                            <div
                              className="stat-editor-card"
                              key={
                                definition
                                  .key
                              }
                            >

                              <div className="stat-editor-title">

                                <div>
                                  <span>
                                    {
                                      definition
                                        .label
                                    }
                                  </span>

                                  <small>
                                    Rating average:
                                    {" "}
                                    {
                                      calculated
                                        .average
                                    }
                                    /5
                                  </small>
                                </div>


                                <strong>
                                  {
                                    editable
                                      .score
                                  }
                                </strong>

                              </div>


                              <div className="stat-progress">
                                <motion.div
                                  initial={{
                                    width:
                                      0,
                                  }}
                                  animate={{
                                    width:
                                      `${editable.score}%`,
                                  }}
                                  transition={{
                                    duration:
                                      0.5,
                                  }}
                                />
                              </div>


                              <div className="stat-edit-grid">

                                <label>
                                  <span>
                                    Final Score
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={
                                      editable
                                        .score
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateScore(
                                        definition
                                          .key,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  />
                                </label>


                                <label>
                                  <span>
                                    Final Title
                                  </span>

                                  <input
                                    value={
                                      editable
                                        .title
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateTitle(
                                        definition
                                          .key,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  />
                                </label>

                              </div>


                              <div className="suggested-stat-line">

                                <span>
                                  CALCULATED
                                </span>

                                <strong>
                                  {
                                    calculated
                                      .score
                                  }
                                  /100
                                </strong>

                                <span>
                                  SUGGESTED TITLE
                                </span>

                                <strong>
                                  {calculated
                                    .suggestedTitle
                                    ?.title ??
                                    "—"}
                                </strong>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}


                  {modalError && (
                    <div className="faculty-form-error stats-modal-error">
                      {modalError}
                    </div>
                  )}


                  {statsPreview.totalRatings >
                    0 && (
                    <div className="stats-modal-actions">

                      <button
                        className="archive-secondary-button"
                        onClick={
                          resetToSuggested
                        }
                      >
                        <RefreshCw
                          size={15}
                        />

                        Reset to Calculated
                      </button>


                      <button
                        className="archive-primary-button"
                        disabled={
                          !canFinalize ||
                          finalizing
                        }
                        onClick={
                          finalizeStats
                        }
                      >
                        {selectedTeacher
                          ?.statsFinalized ? (
                          <>
                            <Save
                              size={15}
                            />

                            {finalizing
                              ? "Saving..."
                              : "Update Final Stats"}
                          </>
                        ) : (
                          <>
                            <CheckCircle2
                              size={15}
                            />

                            {finalizing
                              ? "Finalizing..."
                              : "Finalize Stats"}
                          </>
                        )}
                      </button>

                    </div>
                  )}

                </>
              ) : null}

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}