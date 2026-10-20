import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  ArrowRight,
  Check,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/http";

import {
  useStudentAuth,
} from "../../context/StudentAuthContext";


const BACKEND_ORIGIN =
  "http://localhost:5000";


function getPhotoUrl(
  photoUrl
) {
  if (!photoUrl) {
    return null;
  }

  const normalized =
    String(photoUrl)
      .trim()
      .replace(/\\/g, "/");

  if (
    normalized.startsWith(
      "http://"
    ) ||
    normalized.startsWith(
      "https://"
    )
  ) {
    return normalized;
  }

  return `${BACKEND_ORIGIN}${
    normalized.startsWith("/")
      ? ""
      : "/"
  }${normalized}`;
}


export default function FacultyCollection() {
  const {
    semesterSlug,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    student,
  } = useStudentAuth();


  const ratingsOpen =
    Boolean(
      student?.semester
        ?.ratingsOpen
    );


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


  async function loadTeachers() {
    try {
      setLoading(true);

      setError("");

      const response =
        await api.get(
          "/student/teachers"
        );

      setTeachers(
        response.data.teachers ??
          []
      );

    } catch (err) {
      console.error(
        "Faculty collection error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          "Unable to load your professors."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadTeachers();
  }, []);


  const filteredTeachers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return teachers;
      }

      return teachers.filter(
        (teacher) => {
          const name =
            teacher.name
              ?.toLowerCase() ??
            "";

          const department =
            teacher.department
              ?.toLowerCase() ??
            "";

          return (
            name.includes(query) ||
            department.includes(
              query
            )
          );
        }
      );
    }, [
      teachers,
      search,
    ]);


  const ratedCount =
    teachers.filter(
      (teacher) =>
        teacher.rated
    ).length;


  const remainingCount =
    teachers.length -
    ratedCount;


  function rateProfessor(
    teacher
  ) {
    console.log(
      "Clicked teacher:",
      teacher
    );

    if (
      teacher.rated ||
      !ratingsOpen
    ) {
      return;
    }

    const teacherId =
      teacher.id ??
      teacher.teacherId;

    console.log(
      "Resolved teacherId:",
      teacherId
    );

    if (!teacherId) {
      console.error(
        "Teacher ID missing:",
        teacher
      );

      return;
    }

    navigate(
      `/rate/${semesterSlug}/dex/rate/${teacherId}`
    );
  }


  return (
    <div className="faculty-collection-page">

      {/* =====================================
          HERO
          ===================================== */}

      <motion.section
        className="faculty-collection-hero"

        initial={{
          opacity: 0,
          y: 16,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <div className="collection-hero-copy">

          <div className="collection-eyebrow">

            <Sparkles
              size={15}
            />

            FACULTY COLLECTION

          </div>


          <h1>
            Meet your
            {" "}

            <span>
              professors.
            </span>
          </h1>


          <p>
            Choose a professor and
            share your classroom
            experience through five
            quick ProfessorDex
            categories.
          </p>


          <div className="collection-privacy-note">

            <ShieldCheck
              size={17}
            />

            Your submitted answers
            remain separate from your
            student identity.

          </div>


          <div
            className={
              ratingsOpen
                ? "collection-gate-banner open"
                : "collection-gate-banner closed"
            }
          >

            <span className="collection-gate-dot" />


            <div>

              <strong>
                {ratingsOpen
                  ? "Rating window is open"
                  : "Rating window is currently closed"}
              </strong>


              <p>
                {ratingsOpen
                  ? "You can submit ratings for professors in your semester."
                  : "You can browse your faculty, but new ratings cannot be submitted right now."}
              </p>

            </div>

          </div>

        </div>


        <div className="collection-semester-orb">

          <div className="semester-orb-ring">

            <GraduationCap
              size={36}
            />

          </div>


          <span>
            CURRENT PORTAL
          </span>


          <strong>
            {
              student?.semester
                ?.name
            }
          </strong>

        </div>

      </motion.section>


      {/* =====================================
          COLLECTION STATS
          ===================================== */}

      <section className="collection-overview">

        <div className="collection-stat">

          <span>
            FACULTY
          </span>

          <strong>
            {teachers.length}
          </strong>

          <p>
            Professors assigned to
            your semester.
          </p>

        </div>


        <div className="collection-stat">

          <span>
            RATED
          </span>

          <strong>
            {ratedCount}
          </strong>

          <p>
            Ratings successfully
            submitted.
          </p>

        </div>


        <div className="collection-stat">

          <span>
            REMAINING
          </span>

          <strong>
            {remainingCount}
          </strong>

          <p>
            Professors still waiting
            for your rating.
          </p>

        </div>

      </section>


      {/* =====================================
          TOOLBAR
          ===================================== */}

      <section className="collection-toolbar">

        <div className="collection-toolbar-title">

          <Star
            size={17}
          />


          <div>

            <span>
              YOUR FACULTY
            </span>

            <strong>
              Professor Collection
            </strong>

          </div>

        </div>


        <div className="collection-search">

          <Search
            size={17}
          />

          <input
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search professor or department..."
          />


          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              <X
                size={15}
              />
            </button>
          )}

        </div>

      </section>


      {/* =====================================
          ERROR
          ===================================== */}

      {error && (
        <div className="student-collection-error">
          {error}
        </div>
      )}


      {/* =====================================
          COLLECTION
          ===================================== */}

      {loading ? (
        <div className="faculty-collection-loading">

          <div className="student-loading-orb">
            PD
          </div>

          <p>
            Gathering your faculty
            collection...
          </p>

        </div>

      ) : filteredTeachers.length ===
        0 ? (

        <div className="faculty-collection-empty">

          <GraduationCap
            size={34}
          />

          <h2>
            No professors found
          </h2>

          <p>
            {search
              ? "No faculty member matches your search."
              : "No professors have been assigned to this semester yet."}
          </p>

        </div>

      ) : (

        <section className="student-professor-grid">

          {filteredTeachers.map(
            (
              teacher,
              index
            ) => {

              const photoUrl =
                getPhotoUrl(
                  teacher.photoUrl
                );


              const teacherKey =
                teacher.id ??
                teacher.teacherId;


              return (
                <motion.article
                  key={
                    teacherKey
                  }

                  className={
                    teacher.rated
                      ? "student-professor-card rated"
                      : "student-professor-card"
                  }

                  initial={{
                    opacity: 0,
                    y: 18,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  transition={{
                    delay:
                      index *
                      0.05,
                  }}
                >

                  <div className="student-card-glow" />


                  <div className="student-professor-number">

                    FACULTY
                    {" "}

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>


                  <div className="student-professor-photo">

                    <div className="student-photo-ring">

                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={
                            teacher.name
                          }
                        />
                      ) : (
                        <UserRound
                          size={45}
                        />
                      )}

                    </div>


                    {teacher.rated && (
                      <div className="student-rated-orb">

                        <Check
                          size={19}
                        />

                      </div>
                    )}

                  </div>


                  <div className="student-professor-info">

                    <span className="student-professor-department">
                      {
                        teacher.department
                      }
                    </span>


                    <h2>
                      {teacher.name}
                    </h2>


                    <p>
                      {teacher.description ||
                        "Faculty member of your current semester."}
                    </p>

                  </div>


                  <div className="student-professor-footer">

                    {teacher.rated ? (

                      <div className="student-rated-state">

                        <Check
                          size={17}
                        />


                        <div>

                          <strong>
                            Rated
                          </strong>

                          <span>
                            Response submitted
                          </span>

                        </div>

                      </div>

                    ) : !ratingsOpen ? (

                      <div className="student-rating-closed-state">

                        <ShieldCheck
                          size={17}
                        />


                        <div>

                          <strong>
                            Ratings Closed
                          </strong>

                          <span>
                            Waiting for admin to reopen the window
                          </span>

                        </div>

                      </div>

                    ) : (

                      <button
                        className="student-rate-button"
                        onClick={() =>
                          rateProfessor(
                            teacher
                          )
                        }
                      >

                        Rate Professor

                        <ArrowRight
                          size={17}
                        />

                      </button>

                    )}

                  </div>

                </motion.article>
              );
            }
          )}

        </section>
      )}

    </div>
  );
}