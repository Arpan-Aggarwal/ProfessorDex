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
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Laugh,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
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


const ratingSteps = [
  {
    key: "teachingAura",
    category: "TEACHING_AURA",
    label: "Teaching Aura",
    short:
      "How clearly do concepts land?",
    icon: GraduationCap,
    tone: "teaching",
  },

  {
    key: "humourMeter",
    category: "HUMOUR_METER",
    label: "Humour Meter",
    short:
      "What is the humour energy like?",
    icon: Laugh,
    tone: "humour",
  },

  {
    key: "classroomVibe",
    category: "CLASSROOM_VIBE",
    label: "Classroom Vibe",
    short:
      "How does the classroom feel?",
    icon: Sparkles,
    tone: "vibe",
  },

  {
    key: "mentorEnergy",
    category: "MENTOR_ENERGY",
    label: "Mentor Energy",
    short:
      "How supportive is their guidance?",
    icon: HeartHandshake,
    tone: "mentor",
  },

  {
    key: "classroomPresence",
    category: "CLASSROOM_PRESENCE",
    label: "Classroom Presence",
    short:
      "What kind of presence do they have?",
    icon: UsersRound,
    tone: "presence",
  },
];


export default function ProfessorRating() {
  const {
    semesterSlug,
    teacherId,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    student,
  } = useStudentAuth();


  const [
    teacher,
    setTeacher,
  ] = useState(null);

  const [
    ratingData,
    setRatingData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);


  async function loadRatingPage() {
    try {
      setLoading(true);

      setError("");

      const [
        teacherResponse,
        optionsResponse,
      ] = await Promise.all([
        api.get(
          `/student/teachers/${teacherId}`
        ),

        api.get(
          "/student/ratings/options"
        ),
      ]);

      setTeacher(
        teacherResponse.data.teacher
      );

      setRatingData(
        optionsResponse.data
      );

    } catch (err) {
      console.error(
        "Rating page load error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          "Unable to open this professor rating."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadRatingPage();
  }, [teacherId]);


  const isReview =
    currentStep ===
    ratingSteps.length;


  const step =
    !isReview
      ? ratingSteps[currentStep]
      : null;


  const currentOptions =
    useMemo(() => {
      if (
        !step ||
        !ratingData
      ) {
        return [];
      }

      return (
        ratingData.categories?.[
          step.category
        ] ?? []
      );
    }, [
      step,
      ratingData,
    ]);


  const selectedValue =
    step
      ? answers[step.key]
      : null;


  const completedCount =
    Object.keys(
      answers
    ).length;


  const progress =
    isReview
      ? 100
      : Math.round(
          (
            currentStep /
            ratingSteps.length
          ) *
            100
        );


  function goBack() {
    if (currentStep === 0) {
      navigate(
        `/rate/${semesterSlug}/dex`
      );

      return;
    }

    setCurrentStep(
      (current) =>
        current - 1
    );
  }


  function chooseOption(
    value
  ) {
    setAnswers(
      (current) => ({
        ...current,

        [step.key]:
          value,
      })
    );
  }


  function continueRating() {
    if (
      !answers[
        ratingSteps[
          currentStep
        ]?.key
      ]
    ) {
      return;
    }

    setCurrentStep(
      (current) =>
        current + 1
    );
  }


  function editAnswer(
    index
  ) {
    setCurrentStep(index);
  }


  function getSelectedOption(
    definition
  ) {
    const value =
      answers[
        definition.key
      ];

    return (
      ratingData?.categories?.[
        definition.category
      ]?.find(
        (option) =>
          option.value ===
          value
      ) ?? null
    );
  }


  async function submitRating() {
    if (
      completedCount !==
      ratingSteps.length
    ) {
      setError(
        "Please answer all five categories before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      await api.post(
        `/student/ratings/${teacherId}`,
        {
          teachingAura:
            answers.teachingAura,

          humourMeter:
            answers.humourMeter,

          classroomVibe:
            answers.classroomVibe,

          mentorEnergy:
            answers.mentorEnergy,

          classroomPresence:
            answers.classroomPresence,
        }
      );

      setSubmitted(true);

    } catch (err) {
      console.error(
        "Rating submission error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          "Unable to submit your rating."
      );

    } finally {
      setSubmitting(false);
    }
  }


  const photoUrl =
    getPhotoUrl(
      teacher?.photoUrl
    );


  if (loading) {
    return (
      <div className="professor-rating-loading">

        <div className="student-loading-orb">
          PD
        </div>

        <p>
          Preparing your rating
          chamber...
        </p>

      </div>
    );
  }


  if (
    student &&
    !student.semester
      ?.ratingsOpen
  ) {
    return (
      <div className="rating-closed-page">

        <motion.div
          className="rating-closed-card"

          initial={{
            opacity: 0,
            y: 15,
            scale: 0.97,
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
        >

          <div className="rating-closed-icon">

            <ShieldCheck
              size={38}
            />

          </div>


          <span>
            RATING WINDOW CLOSED
          </span>


          <h1>
            Ratings are paused.
          </h1>


          <p>
            Your semester's rating
            window is currently closed.
            You can return to the faculty
            collection and continue when
            the admin reopens it.
          </p>


          <button
            className="student-primary-action"
            onClick={() =>
              navigate(
                `/rate/${semesterSlug}/dex`
              )
            }
          >

            Back to Faculty

            <ArrowRight
              size={17}
            />

          </button>

        </motion.div>

      </div>
    );
  }


  if (error && !teacher) {
    return (
      <div className="professor-rating-fatal">

        <Sparkles
          size={32}
        />

        <h2>
          Rating unavailable
        </h2>

        <p>
          {error}
        </p>

        <button
          className="student-primary-action"
          onClick={() =>
            navigate(
              `/rate/${semesterSlug}/dex`
            )
          }
        >
          Back to Faculty
        </button>

      </div>
    );
  }


  if (teacher?.rated) {
    return (
      <div className="already-rated-page">

        <motion.div
          className="already-rated-card"

          initial={{
            opacity: 0,
            scale: 0.96,
            y: 15,
          }}

          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
        >

          <div className="already-rated-icon">

            <CheckCircle2
              size={40}
            />

          </div>

          <span>
            RESPONSE ALREADY SEALED
          </span>

          <h1>
            {teacher.name}
          </h1>

          <p>
            You have already rated
            this professor. ProfessorDex
            accepts only one response
            per student for each
            professor.
          </p>

          <button
            className="student-primary-action"
            onClick={() =>
              navigate(
                `/rate/${semesterSlug}/dex`
              )
            }
          >
            Back to Faculty

            <ArrowRight
              size={17}
            />
          </button>

        </motion.div>

      </div>
    );
  }


  if (submitted) {
    return (
      <div className="rating-success-page">

        <motion.div
          className="rating-success-card"

          initial={{
            opacity: 0,
            scale: 0.94,
          }}

          animate={{
            opacity: 1,
            scale: 1,
          }}

          transition={{
            duration: 0.45,
          }}
        >

          <motion.div
            className="rating-success-rings"

            initial={{
              scale: 0.5,
              opacity: 0,
            }}

            animate={{
              scale: 1,
              opacity: 1,
            }}

            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 130,
            }}
          >

            <div className="success-ring-one" />
            <div className="success-ring-two" />

            <div className="success-core">

              <Check
                size={38}
              />

            </div>

          </motion.div>


          <div className="rating-success-eyebrow">

            <Sparkles
              size={14}
            />

            RATING SEALED

          </div>


          <h1>
            Response received.
          </h1>


          <p>
            Your rating for
            {" "}

            <strong>
              {teacher.name}
            </strong>

            {" "}
            has entered the anonymous
            ProfessorDex archive.
          </p>


          <div className="success-privacy">

            <ShieldCheck
              size={17}
            />

            Your individual answers
            are not shown to other
            students.

          </div>


          <button
            className="student-primary-action"
            onClick={() =>
              navigate(
                `/rate/${semesterSlug}/dex`
              )
            }
          >
            Return to Faculty

            <ArrowRight
              size={17}
            />
          </button>

        </motion.div>

      </div>
    );
  }


  return (
    <div className="professor-rating-page">

      {/* =====================================
          TOP BAR
          ===================================== */}

      <div className="rating-topbar">

        <button
          className="rating-back-button"
          onClick={
            goBack
          }
        >
          <ArrowLeft
            size={16}
          />

          {currentStep === 0
            ? "Faculty Collection"
            : "Previous"}
        </button>


        <div className="rating-progress-meta">

          <span>
            {isReview
              ? "FINAL REVIEW"
              : `CATEGORY ${currentStep + 1} OF ${ratingSteps.length}`}
          </span>

          <strong>
            {completedCount}
            /
            {ratingSteps.length}
            {" "}
            answered
          </strong>

        </div>

      </div>


      {/* =====================================
          PROGRESS
          ===================================== */}

      <div className="rating-progress-track">

        <motion.div
          animate={{
            width:
              `${progress}%`,
          }}

          transition={{
            duration: 0.35,
          }}
        />

      </div>


      {/* =====================================
          PROFESSOR HEADER
          ===================================== */}

      <section className="rating-professor-header">

        <div className="rating-professor-photo">

          {photoUrl ? (
            <img
              src={photoUrl}
              alt={
                teacher.name
              }
            />
          ) : (
            <UserRound
              size={37}
            />
          )}

        </div>


        <div>

          <span>
            YOU'RE RATING
          </span>

          <h2>
            {teacher.name}
          </h2>

          <p>
            {teacher.department}
          </p>

        </div>


        <div className="rating-anonymous-badge">

          <ShieldCheck
            size={15}
          />

          Anonymous

        </div>

      </section>


      {/* =====================================
          QUESTIONS
          ===================================== */}

      <AnimatePresence
        mode="wait"
      >

        {!isReview ? (
          <motion.section
            key={
              step.key
            }

            className={`rating-question-stage question-${step.tone}`}

            initial={{
              opacity: 0,
              x: 25,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}

            exit={{
              opacity: 0,
              x: -25,
            }}

            transition={{
              duration: 0.25,
            }}
          >

            <div className="question-heading">

              <div className="question-icon">

                <step.icon
                  size={26}
                />

              </div>


              <div>

                <span>
                  {step.label}
                </span>

                <h1>
                  {ratingData
                    ?.questions?.[
                      step.category
                    ] ??
                    step.short}
                </h1>

                <p>
                  Choose the description
                  that feels closest to
                  your classroom
                  experience.
                </p>

              </div>

            </div>


            <div className="rating-option-grid">

              {currentOptions.map(
                (
                  option,
                  index
                ) => {

                  const selected =
                    selectedValue ===
                    option.value;


                  return (
                    <motion.button
                      type="button"

                      key={
                        option.id ??
                        option.value
                      }

                      className={
                        selected
                          ? "rating-choice-card selected"
                          : "rating-choice-card"
                      }

                      onClick={() =>
                        chooseOption(
                          option.value
                        )
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
                          0.045,
                      }}
                    >

                      <div className="choice-index">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>


                      <div className="choice-copy">

                        <strong>
                          {option.title}
                        </strong>

                        <p>
                          {option.explanation}
                        </p>

                      </div>


                      <div className="choice-check">

                        {selected && (
                          <Check
                            size={17}
                          />
                        )}

                      </div>

                    </motion.button>
                  );
                }
              )}

            </div>


            <div className="rating-navigation">

              <span>
                Your choice cannot be
                viewed by other
                students.
              </span>


              <button
                className="student-primary-action"
                disabled={
                  !selectedValue
                }
                onClick={
                  continueRating
                }
              >
                {currentStep ===
                ratingSteps.length -
                  1
                  ? "Review Rating"
                  : "Continue"}

                <ArrowRight
                  size={17}
                />
              </button>

            </div>

          </motion.section>
        ) : (
          <motion.section
            key="review"

            className="rating-review-stage"

            initial={{
              opacity: 0,
              x: 25,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}
          >

            <div className="review-heading">

              <div className="review-sigil">

                <Star
                  size={27}
                />

              </div>

              <span>
                FINAL REVIEW
              </span>

              <h1>
                Ready to seal it?
              </h1>

              <p>
                Check your choices
                before submitting. After
                submission, this rating
                cannot be edited.
              </p>

            </div>


            <div className="rating-review-list">

              {ratingSteps.map(
                (
                  definition,
                  index
                ) => {

                  const selected =
                    getSelectedOption(
                      definition
                    );

                  const Icon =
                    definition.icon;


                  return (
                    <div
                      className={`review-answer-card review-${definition.tone}`}
                      key={
                        definition.key
                      }
                    >

                      <div className="review-answer-icon">

                        <Icon
                          size={21}
                        />

                      </div>


                      <div className="review-answer-copy">

                        <span>
                          {
                            definition.label
                          }
                        </span>

                        <strong>
                          {
                            selected?.title
                          }
                        </strong>

                      </div>


                      <button
                        onClick={() =>
                          editAnswer(
                            index
                          )
                        }
                      >
                        Edit
                      </button>

                    </div>
                  );
                }
              )}

            </div>


            {error && (
              <div className="student-form-error rating-submit-error">
                {error}
              </div>
            )}


            <div className="rating-submit-warning">

              <ShieldCheck
                size={18}
              />

              <p>
                Your account confirms
                that you are allowed to
                rate this professor,
                but the stored rating
                does not contain your
                email or student ID.
              </p>

            </div>


            <button
              className="rating-seal-button"
              onClick={
                submitRating
              }
              disabled={
                submitting
              }
            >

              {submitting ? (
                <>
                  <LoaderCircle
                    className="rating-spinner"
                    size={19}
                  />

                  Sealing Rating...
                </>
              ) : (
                <>
                  <Sparkles
                    size={18}
                  />

                  Seal Anonymous Rating
                </>
              )}

            </button>

          </motion.section>
        )}

      </AnimatePresence>

    </div>
  );
}