import {
  useEffect,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  ArrowRight,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";


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


function getPortalName(
  slug
) {
  const names = {
    "applied-dept-1":
      "Applied Dept. I",

    "applied-dept-2":
      "Applied Dept. II",

    "cse-2nd":
      "CSE 2nd",

    "cse-3rd":
      "CSE 3rd",

    "aiml-2nd":
      "AI/ML 2nd",

    "aiml-3rd":
      "AI/ML 3rd",

    mechanical:
      "Mechanical",

    biotech:
      "Biotech",

    ar:
      "AR",

    ece:
      "ECE",

    bba:
      "BBA",
  };

  return (
    names[slug] ??
    "Unknown Portal"
  );
}



export default function StudentWelcome() {
  const {
    semesterSlug,
  } = useParams();

  const navigate =
    useNavigate();


  const validSemester =
    VALID_SEMESTERS.has(
      semesterSlug
    );

  const portalName =
  getPortalName(
    semesterSlug
  );

  useEffect(() => {
    /*
     * Entering the public portal resets
     * temporary portal authentication.
     *
     * The account may still have a valid
     * backend session, but authentication
     * is required again before /dex.
     */

    sessionStorage.removeItem(
      PORTAL_AUTH_KEY
    );
  }, [
    semesterSlug,
  ]);


  function enterPortal() {
    if (!validSemester) {
      return;
    }

    navigate(
      `/rate/${semesterSlug}/login`
    );
  }


  if (!validSemester) {
    return (
      <div className="student-auth-page">

        <div className="student-auth-grid" />

        <motion.div
          className="student-welcome"

          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div className="welcome-dex-symbol">

            <GraduationCap
              size={38}
            />

          </div>


          <div className="student-welcome-brand">
            Professor<span>Dex</span>
          </div>


          <div className="student-semester-badge">

            <ShieldCheck
              size={14}
            />

            INVALID PORTAL

          </div>


          <h1>
            Portal not found.
          </h1>


          <p>
            This ProfessorDex semester
            portal does not exist.
            Student access is currently
            available only for Semesters
            1 through 4.
          </p>


          <div className="student-welcome-actions">

            <button
              className="student-primary-action"
              onClick={() =>
                navigate(
                  "/rate/sem-1"
                )
              }
            >

              Go to Semester 1

              <ArrowRight
                size={18}
              />

            </button>

          </div>

        </motion.div>

      </div>
    );
  }


  return (
    <div className="student-auth-page">

      <div className="student-auth-grid" />


      <div className="student-floating-star star-one">
        ✦
      </div>

      <div className="student-floating-star star-two">
        ✧
      </div>

      <div className="student-floating-star star-three">
        ✦
      </div>


      <motion.div
        className="student-welcome"

        initial={{
          opacity: 0,
          y: 20,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.65,
        }}
      >

        <div className="welcome-dex-symbol">

          <GraduationCap
            size={38}
          />

        </div>


        <div className="student-welcome-brand">
          Professor<span>Dex</span>
        </div>


        <div className="student-semester-badge">

          <Sparkles
            size={14}
          />

          SEMESTER
          {" "}
          {portalName}

        </div>


        <h1>
          Your professors.
          <br />

          <span>
            Your experience.
          </span>
        </h1>


        <p>
          Rate the faculty you actually
          learned from. Your responses
          help shape their final
          ProfessorDex identity while
          staying separate from your
          student profile.
        </p>


        <div className="student-trust-row">

          <div>

            <ShieldCheck
              size={18}
            />

            <span>
              Anonymous
              responses
            </span>

          </div>


          <div>

            <KeyRound
              size={18}
            />

            <span>
              Private access
            </span>

          </div>


          <div>

            <Star
              size={18}
            />

            <span>
              One rating per
              professor
            </span>

          </div>

        </div>


        <div className="student-welcome-actions">

          <button
            className="student-primary-action"
            onClick={
              enterPortal
            }
          >

            Enter ProfessorDex

            <ArrowRight
              size={18}
            />

          </button>


          <button
            className="student-secondary-action"
            onClick={() =>
              navigate(
                `/rate/${semesterSlug}/register`
              )
            }
          >
            Create Student Access
          </button>

        </div>


        <div className="student-welcome-footnote">
          Authentication is required
          every time you enter the
          ProfessorDex portal.
        </div>

      </motion.div>

    </div>
  );
}