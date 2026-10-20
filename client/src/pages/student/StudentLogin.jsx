import {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useStudentAuth,
} from "../../context/StudentAuthContext";

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


export default function StudentLogin() {
  const {
    semesterSlug,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    login,
    logout,
  } = useStudentAuth();


  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const validSemester =
    VALID_SEMESTERS.has(
      semesterSlug
    );


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");


    if (!validSemester) {
      setError(
        "This semester portal does not exist."
      );

      return;
    }


    setSubmitting(true);


    try {
      const result =
        await login(
          email,
          password,
          semesterSlug
        );

      const student =
        result.student;


      if (
        student.semester.slug !==
        semesterSlug
      ) {
        await logout();

        setError(
          `This account belongs to ${student.semester.name}, not this semester portal.`
        );

        return;
      }


      navigate(
        `/rate/${semesterSlug}/dex`,
        {
          replace: true,
        }
      );

    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to enter ProfessorDex."
      );

    } finally {
      setSubmitting(false);
    }
  }


  if (!validSemester) {
    return (
      <div className="student-auth-page">

        <div className="student-auth-grid" />

        <motion.div
          className="student-auth-card"

          initial={{
            opacity: 0,
            y: 18,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div className="student-auth-logo">

            <div>
              <GraduationCap
                size={28}
              />
            </div>

            <strong>
              Professor<span>Dex</span>
            </strong>

          </div>


          <div className="student-auth-copy">

            <div className="student-auth-eyebrow">
              INVALID PORTAL
            </div>

            <h1>
              Semester not found.
            </h1>

            <p>
              Student access is
              available only for
              Semesters 1 through 4.
            </p>

          </div>


          <button
            className="student-primary-action student-form-submit"
            onClick={() =>
              navigate(
                "/rate/sem-1"
              )
            }
          >
            Return to ProfessorDex

            <ArrowRight
              size={18}
            />
          </button>

        </motion.div>

      </div>
    );
  }


  return (
    <div className="student-auth-page">

      <div className="student-auth-grid" />

      <motion.div
        className="student-auth-card"

        initial={{
          opacity: 0,
          y: 18,
          scale: 0.98,
        }}

        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
      >

        <button
          className="student-auth-back"
          onClick={() =>
            navigate(
              `/rate/${semesterSlug}`
            )
          }
        >

          <ArrowLeft
            size={16}
          />

          Back

        </button>


        <div className="student-auth-logo">

          <div>
            <GraduationCap
              size={28}
            />
          </div>

          <strong>
            Professor<span>Dex</span>
          </strong>

        </div>


        <div className="student-auth-copy">

          <div className="student-auth-eyebrow">

            <Sparkles
              size={13}
            />

            STUDENT ACCESS

          </div>

          <h1>
            Welcome back.
          </h1>

          <p>
            Authenticate to continue
            into this semester's
            ProfessorDex portal.
          </p>

        </div>


        <form
          className="student-form"
          onSubmit={
            handleSubmit
          }
        >

          <label>

            <span>
              Email Address
            </span>

            <div className="student-input">

              <Mail
                size={17}
              />

              <input
                type="email"
                value={email}
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="student@example.com"
                required
              />

            </div>

          </label>


          <label>

            <span>
              Password
            </span>

            <div className="student-input">

              <LockKeyhole
                size={17}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Your password"
                required
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
              >

                {showPassword ? (
                  <EyeOff
                    size={16}
                  />
                ) : (
                  <Eye
                    size={16}
                  />
                )}

              </button>

            </div>

          </label>


          {error && (
            <div className="student-form-error">
              {error}
            </div>
          )}


          <button
            className="student-primary-action student-form-submit"
            type="submit"
            disabled={
              submitting
            }
          >

            {submitting
              ? "Authenticating..."
              : "Enter ProfessorDex"}

            <ArrowRight
              size={18}
            />

          </button>

        </form>


        <div className="student-auth-switch">

          New here?

          <button
            onClick={() =>
              navigate(
                `/rate/${semesterSlug}/register`
              )
            }
          >
            Create access
          </button>

        </div>

      </motion.div>

    </div>
  );
}