import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

export default function AdminLogin() {
  const navigate =
    useNavigate();

  const {
    admin,
    login,
  } = useAdminAuth();

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
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (admin) {
      navigate(
        "/admin",
        {
          replace: true,
        }
      );
    }
  }, [
    admin,
    navigate,
  ]);

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(
        email,
        password
      );

      navigate(
        "/admin",
        {
          replace: true,
        }
      );
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "The archive rejected those credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-grid" />
      <div className="login-glow glow-one" />
      <div className="login-glow glow-two" />

      <motion.section
        className="login-intro"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
        }}
      >
        <div className="eyebrow">
          <Sparkles size={15} />

          ProfessorDex
          Administration
        </div>

        <h1>
          Enter the
          <span>
            {" "}
            Arcane Archive.
          </span>
        </h1>

        <p>
          Shape professor
          profiles, command rating
          windows, forge archetypes
          and approve the final
          collectible cards.
        </p>

        <div className="intro-feature">
          <div className="feature-icon">
            <ShieldCheck />
          </div>

          <div>
            <strong>
              Restricted Control
              Room
            </strong>

            <span>
              Administrative access
              only.
            </span>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="login-card-wrap"
        initial={{
          opacity: 0,
          scale: 0.97,
          x: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        transition={{
          duration: 0.65,
          delay: 0.08,
        }}
      >
        <div className="login-card">
          <div className="card-rune">
            PD
          </div>

          <div className="login-card-header">
            <span>
              AUTHORIZATION
            </span>

            <h2>
              Admin Access
            </h2>

            <p>
              Authenticate to enter
              the ProfessorDex
              control room.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="login-form"
          >
            <label>
              Email

              <div className="input-shell">
                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="admin@professordex.local"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label>
              Password

              <div className="input-shell password-shell">
                <LockKeyhole
                  size={17}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}
                </button>
              </div>
            </label>

            {error && (
              <motion.div
                className="form-error"
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="primary-action"
              disabled={
                submitting
              }
            >
              <span>
                {submitting
                  ? "Opening Archive..."
                  : "Enter Control Room"}
              </span>

              <ArrowRight
                size={18}
              />
            </button>
          </form>
        </div>
      </motion.section>
    </div>
  );
}