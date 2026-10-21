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
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
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


export default function StudentRegister() {
  const {
    semesterSlug,
  } = useParams();

  const validSemester =
  VALID_SEMESTERS.has(
    semesterSlug
  );

  const navigate =
    useNavigate();

  const {
    register,
  } = useStudentAuth();


  const [
    form,
    setForm,
  ] = useState({
    email: "",
    password: "",
    privateCode: "",
  });


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


  function updateField(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );
  }


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


    if (
      form.password.length <
      8
    ) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    try {
      setSubmitting(true);


      const result =
        await register({
          email:
            form.email,

          password:
            form.password,

          privateCode:
            form.privateCode,

          semesterSlug,
        });


      navigate(
        `/rate/${result.student.semester.slug}/dex`,
        {
          replace: true,
        }
      );

    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to create your ProfessorDex access."
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="student-auth-page">

      <div className="student-auth-grid" />

      <motion.div
        className="student-auth-card student-register-card"

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

            CREATE ACCESS

          </div>

          <h1>
            Join the Dex.
          </h1>

          <p>
            Your one-time private code
            determines which semester
            portal you can enter.
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
                value={
                  form.email
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "email",
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
              New Password
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
                  form.password
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "password",
                    event.target.value
                  )
                }
                placeholder="Minimum 8 characters"
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


          <label>

            <span>
              Private Access Code
            </span>

            <div className="student-input student-code-input">

              <KeyRound
                size={17}
              />

              <input
                value={
                  form.privateCode
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "privateCode",
                    event.target.value
                      .replace(/\s+/g, "")
                      .toUpperCase()
                  )
                }
                placeholder="5-character code (e.g. K9X2M)"
                maxLength={10}
                autoComplete="off"
                spellCheck="false"
                required
              />

            </div>

          </label>


          <div className="student-privacy-note">

            <ShieldCheck
              size={17}
            />

            <p>
              Your account controls
              access only. Professor
              ratings are stored using
              an anonymous verification
              hash rather than your
              email.
            </p>

          </div>


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
              ? "Creating Access..."
              : "Create Access"}

            <ArrowRight
              size={18}
            />

          </button>

        </form>


        <div className="student-auth-switch">

          Already registered?

          <button
            onClick={() =>
              navigate(
                `/rate/${semesterSlug}/login`
              )
            }
          >
            Sign in
          </button>

        </div>

      </motion.div>

    </div>
  );
}