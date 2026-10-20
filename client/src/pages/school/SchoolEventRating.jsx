import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import api from "../../api/http";
import "../../styles/schoolRating.css";

const categories = [
  {
    key: "teachingAura",
    name: "Teaching Aura",
    description: "How effectively does this teacher explain and teach?",
    low: "Needs improvement",
    high: "Outstanding",
  },
  {
    key: "humourMeter",
    name: "Humour Meter",
    description: "How enjoyable and fun are their classes?",
    low: "Very serious",
    high: "Full of humour",
  },
  {
    key: "classroomVibe",
    name: "Classroom Vibe",
    description: "How comfortable and engaging is the classroom?",
    low: "Less engaging",
    high: "Amazing atmosphere",
  },
  {
    key: "mentorEnergy",
    name: "Mentor Energy",
    description: "How supportive and helpful is this teacher?",
    low: "Less supportive",
    high: "Excellent mentor",
  },
  {
    key: "classroomPresence",
    name: "Classroom Presence",
    description: "How confident and impactful is their presence?",
    low: "Low impact",
    high: "Powerful presence",
  },
];

const initialRatings = {
  teachingAura: 0,
  humourMeter: 0,
  classroomVibe: 0,
  mentorEnergy: 0,
  classroomPresence: 0,
};

const labels = [
  "",
  "Needs improvement",
  "Fair",
  "Good",
  "Very good",
  "Excellent",
];

function getError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to complete the request."
  );
}

function getPhotoUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const base = new URL(
    api.defaults.baseURL || window.location.origin,
    window.location.origin
  ).origin;

  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

export default function SchoolEventRating() {
  const [teachers, setTeachers] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [ratings, setRatings] = useState(initialRatings);
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState("selection");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submittingRef = useRef(false);
  const mountedRef = useRef(true);

  const loadTeachers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const response = await api.get(
        "/school-event/teachers",
        { headers: { "Cache-Control": "no-cache" } }
      );

      if (!mountedRef.current) return;

      setTeachers(response.data.teachers || []);
      setError("");
    } catch (err) {
      if (mountedRef.current) setError(getError(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadTeachers();

    return () => {
      mountedRef.current = false;
    };
  }, [loadTeachers]);

  function resetForNextStudent() {
    if (submittingRef.current) return;

    setTeacher(null);
    setRatings({ ...initialRatings });
    setStep(0);
    setScreen("selection");
    setError("");
    loadTeachers();
  }

  function selectTeacher(item) {
    setTeacher(item);
    setRatings({ ...initialRatings });
    setStep(0);
    setError("");
    setScreen("rating");
  }

  function selectRating(value) {
    if (submitting) return;

    const category = categories[step];

    setRatings((previous) => ({
      ...previous,
      [category.key]: value,
    }));
  }

  function nextStep() {
    const category = categories[step];

    if (!ratings[category.key]) return;

    if (step === categories.length - 1) {
      setScreen("review");
    } else {
      setStep((current) => current + 1);
    }
  }

  async function submitRating() {
    if (!teacher || submittingRef.current) return;

    const valid = categories.every((category) => {
      const value = ratings[category.key];
      return Number.isInteger(value) && value >= 1 && value <= 5;
    });

    if (!valid) {
      setError("Please rate all five categories before submitting.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      await api.post(
        `/school-event/teachers/${teacher.id}/ratings`,
        ratings
      );

      setScreen("success");
    } catch (err) {
      const status = err?.response?.status;

      if (status === 409 || status === 404) {
        setError(
          "This teacher is no longer accepting ratings. Please return to the teacher list."
        );
      } else {
        setError(
          `${getError(err)} If the connection was interrupted, ask the supervisor before submitting again to avoid a duplicate.`
        );
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const currentCategory = categories[step];
  const currentValue = ratings[currentCategory.key];
  const allRated = categories.every((item) => ratings[item.key] > 0);

  return (
    <div className="ser-page">
      <div className="ser-glow ser-glow-one" />
      <div className="ser-glow ser-glow-two" />

      <header className="ser-header">
        <div className="ser-brand">
          <span className="ser-brand-icon">
            <Sparkles size={23} />
          </span>
          <div>
            <strong>ProfessorDex</strong>
            <small>SCHOOL EVENT EDITION</small>
          </div>
        </div>

        <span className="ser-anonymous">
          <ShieldCheck size={16} />
          Anonymous Rating
        </span>
      </header>

      <main className="ser-main">
        {screen === "selection" && (
          <section className="ser-selection">
            <div className="ser-intro">
              <span className="ser-eyebrow">
                THE FACULTY CHRONICLES
              </span>
              <h1>
                Every Teacher
                <span> Has a Legend.</span>
              </h1>
              <p>
                Choose a teacher and share your experience
                across five categories. Your ratings help
                shape their ProfessorDex card.
              </p>
            </div>

            <div className="ser-section-heading">
              <div>
                <h2>Choose Your Teacher</h2>
                <p>Only teachers currently accepting ratings appear here.</p>
              </div>

              <button
                className="ser-icon-button"
                onClick={() => loadTeachers()}
                disabled={loading}
                aria-label="Refresh teacher list"
                title="Refresh teachers"
              >
                <RefreshCw size={19} />
              </button>
            </div>

            {error && (
              <div className="ser-error" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="ser-empty">
                <LoaderCircle className="ser-spin" size={32} />
                <p>Finding available teachers...</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="ser-empty">
                <GraduationCap size={45} />
                <h3>No teachers available right now</h3>
                <p>
                  Please ask the event supervisor or try refreshing.
                </p>
              </div>
            ) : (
              <div className="ser-teacher-grid">
                {teachers.map((item) => (
                  <button
                    type="button"
                    className="ser-teacher-card"
                    key={item.id}
                    onClick={() => selectTeacher(item)}
                  >
                    <div className="ser-teacher-photo">
                      {item.photoUrl ? (
                        <img
                          src={getPhotoUrl(item.photoUrl)}
                          alt=""
                        />
                      ) : (
                        <GraduationCap size={42} />
                      )}
                    </div>

                    <span className="ser-teacher-info">
                      <strong>{item.name}</strong>
                      <small>{item.schoolName}</small>
                      <span className="ser-teacher-cta">
                        Start Rating <ArrowRight size={16} />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {screen === "rating" && teacher && (
          <section className="ser-rating-panel">
            <div className="ser-rating-top">
              <button
                className="ser-back"
                onClick={() => {
                  if (step === 0) {
                    resetForNextStudent();
                  } else {
                    setStep((value) => value - 1);
                  }
                }}
              >
                <ArrowLeft size={17} /> Back
              </button>

              <span className="ser-step">
                {step + 1} / {categories.length}
              </span>
            </div>

            <div className="ser-progress">
              <div
                style={{
                  width: `${((step + 1) / categories.length) * 100}%`,
                }}
              />
            </div>

            <div className="ser-rating-teacher">
              <span>YOU ARE RATING</span>
              <h2>{teacher.name}</h2>
              <p>{teacher.schoolName}</p>
            </div>

            <div className="ser-question" key={currentCategory.key}>
              <span className="ser-eyebrow">
                CATEGORY {String(step + 1).padStart(2, "0")}
              </span>

              <h1>{currentCategory.name}</h1>
              <p>{currentCategory.description}</p>

              <div className="ser-stars" role="group" aria-label={currentCategory.name}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      value <= currentValue
                        ? "ser-star ser-star-active"
                        : "ser-star"
                    }
                    onClick={() => selectRating(value)}
                    aria-label={`${value} out of 5`}
                    aria-pressed={currentValue === value}
                  >
                    <Star
                      size={36}
                      fill={
                        value <= currentValue
                          ? "currentColor"
                          : "none"
                      }
                    />
                    <small>{value}</small>
                  </button>
                ))}
              </div>

              <div className="ser-rating-scale">
                <span>{currentCategory.low}</span>
                <span>{currentCategory.high}</span>
              </div>

              <div className="ser-rating-feedback" aria-live="polite">
                {currentValue > 0
                  ? `${currentValue}/5 · ${labels[currentValue]}`
                  : "Select a rating to continue"}
              </div>
            </div>

            <button
              className="ser-primary-button"
              disabled={!currentValue}
              onClick={nextStep}
            >
              {step === categories.length - 1
                ? "Review Your Ratings"
                : "Next Category"}
              <ArrowRight size={18} />
            </button>
          </section>
        )}

        {screen === "review" && teacher && (
          <section className="ser-rating-panel">
            <button
              className="ser-back"
              onClick={() => {
                setStep(categories.length - 1);
                setScreen("rating");
              }}
              disabled={submitting}
            >
              <ArrowLeft size={17} /> Edit Ratings
            </button>

            <div className="ser-review-heading">
              <span className="ser-eyebrow">FINAL CHECK</span>
              <h1>Ready to Submit?</h1>
              <p>
                Your ratings for <strong>{teacher.name}</strong>
                {" "}will be submitted anonymously.
              </p>
            </div>

            <div className="ser-review-list">
              {categories.map((category) => (
                <div className="ser-review-item" key={category.key}>
                  <span>{category.name}</span>
                  <strong>
                    {ratings[category.key]}
                    <small> / 5</small>
                  </strong>
                </div>
              ))}
            </div>

            {error && (
              <div className="ser-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="ser-primary-button"
              disabled={!allRated || submitting}
              onClick={submitRating}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="ser-spin" size={18} />
                  Submitting...
                </>
              ) : (
                <>
                  Submit My Ratings
                  <Send size={18} />
                </>
              )}
            </button>
          </section>
        )}

        {screen === "success" && (
          <section className="ser-success">
            <div className="ser-success-icon">
              <CheckCircle2 size={66} />
            </div>

            <span className="ser-eyebrow">
              RATING COMPLETE
            </span>

            <h1>Legend in the Making!</h1>
            <p>
              Your ratings have been saved successfully.
              Thank you for helping create a teacher's
              ProfessorDex legend.
            </p>

            <button
              className="ser-primary-button"
              onClick={resetForNextStudent}
            >
              <RefreshCw size={19} />
              Ready for Next Student
            </button>
          </section>
        )}
      </main>

      <footer className="ser-footer">
        <span>ProfessorDex · School Event Edition</span>
        <span>No account required · Supervised event</span>
      </footer>
    </div>
  );
}