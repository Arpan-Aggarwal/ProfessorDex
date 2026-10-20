import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Crown,
  Dices,
  Flame,
  GraduationCap,
  History,
  Save,
  Search,
  ShieldCheck,
  Smile,
  Snowflake,
  Sparkles,
  Sprout,
  Swords,
  UsersRound,
  WandSparkles,
  X,
  Zap,
  Download,
} from "lucide-react";

import api from "../../api/http";

import {
  toPng,
} from "html-to-image";


const BACKEND_ORIGIN =
  "http://localhost:5000";


function getPhotoUrl(photoUrl) {
  if (!photoUrl) {
    return null;
  }

  const normalized =
    String(photoUrl)
      .trim()
      .replace(/\\/g, "/");

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  return `${BACKEND_ORIGIN}${
    normalized.startsWith("/")
      ? ""
      : "/"
  }${normalized}`;
}


const statsDefinition = [
  {
    key: "teachingAura",
    titleKey: "teachingAuraTitle",
    label: "Teaching Aura",
    icon: GraduationCap,
    tone: "gold",
  },

  {
    key: "humourMeter",
    titleKey: "humourMeterTitle",
    label: "Humour Meter",
    icon: Smile,
    tone: "magenta",
  },

  {
    key: "classroomVibe",
    titleKey: "classroomVibeTitle",
    label: "Classroom Vibe",
    icon: Snowflake,
    tone: "cyan",
  },

  {
    key: "mentorEnergy",
    titleKey: "mentorEnergyTitle",
    label: "Mentor Energy",
    icon: Sprout,
    tone: "green",
  },

  {
    key: "classroomPresence",
    titleKey: "classroomPresenceTitle",
    label: "Classroom Presence",
    icon: UsersRound,
    tone: "red",
  },
];


function getVariantClass(
  variantKey
) {
  const key =
    variantKey ??
    "NEON_BLUE";

  return `card-variant-${key
    .toLowerCase()
    .replaceAll("_", "-")}`;
}

const SPECIAL_MOVE_VISUALS = {
  "Concept Liberation: Final Form": {
    key: "concept-liberation",
    icon: GraduationCap,
  },

  "Infinite Knowledge": {
    key: "infinite-knowledge",
    icon: Sparkles,
  },

  "Comedy Domain: Infinite One-Liners": {
    key: "comedy-domain",
    icon: Smile,
  },

  "Domain Expansion: Absolute Chill": {
    key: "absolute-chill",
    icon: Snowflake,
  },

  "Guidance Overdrive": {
    key: "guidance-overdrive",
    icon: Sprout,
  },

  "Conqueror's Presence": {
    key: "conquerors-presence",
    icon: Crown,
  },

  "Domain Expansion: Complete Silence": {
    key: "complete-silence",
    icon: ShieldCheck,
  },

  "Ultimate Technique: Perfect Balance": {
    key: "perfect-balance",
    icon: Sparkles,
  },

  "Concept Transmutation": {
    key: "concept-transmutation",
    icon: WandSparkles,
  },

  "The Grand Reveal": {
    key: "grand-reveal",
    icon: Sparkles,
  },

  "Knowledge Shockwave": {
    key: "knowledge-shockwave",
    icon: Zap,
  },

  "Master Plan": {
    key: "master-plan",
    icon: BarChart3,
  },

  "Safety Net": {
    key: "safety-net",
    icon: ShieldCheck,
  },

  "Flawless Deduction": {
    key: "flawless-deduction",
    icon: CheckCircle2,
  },

  "Future Insight": {
    key: "future-insight",
    icon: Sparkles,
  },

  "Legendary Lecture": {
    key: "legendary-lecture",
    icon: Crown,
  },

  "Clarity Burst": {
    key: "clarity-burst",
    icon: Zap,
  },

  "Inspiration Surge": {
    key: "inspiration-surge",
    icon: Flame,
  },

  "Wisdom Blueprint": {
    key: "wisdom-blueprint",
    icon: GraduationCap,
  },

  "Legendary Delivery": {
    key: "legendary-delivery",
    icon: Swords,
  },
};


function SpecialMoveVisual({
  moveName,
}) {
  const visual =
    SPECIAL_MOVE_VISUALS[
      moveName
    ] ?? {
      key: "default-vortex",
      icon: Swords,
    };

  const Icon =
    visual.icon;

  return (
    <AnimatePresence
      mode="wait"
    >

      <motion.div
        key={
          visual.key
        }

        className={`special-move-visual move-effect-${visual.key}`}

        initial={{
          opacity: 0,
          scale: 0.75,
          rotate: -8,
        }}

        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}

        exit={{
          opacity: 0,
          scale: 0.8,
        }}

        transition={{
          duration: 0.35,
        }}
      >

        <div className="move-effect-aura" />

        <div className="move-effect-ring move-effect-ring-one" />
        <div className="move-effect-ring move-effect-ring-two" />
        <div className="move-effect-ring move-effect-ring-three" />

        <div className="move-effect-axis move-effect-axis-one" />
        <div className="move-effect-axis move-effect-axis-two" />

        <span className="move-effect-particle particle-one" />
        <span className="move-effect-particle particle-two" />
        <span className="move-effect-particle particle-three" />
        <span className="move-effect-particle particle-four" />
        <span className="move-effect-particle particle-five" />
        <span className="move-effect-particle particle-six" />

        <div className="move-effect-core">

          <Icon
            size={34}
            strokeWidth={1.8}
          />

        </div>

      </motion.div>

    </AnimatePresence>
  );
}
export default function CardForge() {
  const [
    teachers,
    setTeachers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedTeacher,
    setSelectedTeacher,
  ] = useState(null);

  const [
    recommendations,
    setRecommendations,
  ] = useState(null);

  const [
    builder,
    setBuilder,
  ] = useState(null);

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    selectedCard,
    setSelectedCard,
  ] = useState(null);

  const [
    loadingForge,
    setLoadingForge,
  ] = useState(false);

  const [
    savingPersonality,
    setSavingPersonality,
  ] = useState(false);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    actionBusy,
    setActionBusy,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    personality,
    setPersonality,
  ] = useState({
    archetype: "",
    specialMove: "",
    specialMoveDescription: "",
  });

  const cardRef =
  useRef(null);


  async function loadTeachers() {
    try {
      setLoading(true);

      const response =
        await api.get(
          "/admin/ratings/stats/teachers"
        );

      setTeachers(
        response.data
          .teachers ?? []
      );

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data
          ?.message ||
          "Unable to load professors."
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
        (teacher) =>
          teacher.name
            ?.toLowerCase()
            .includes(query) ||
          teacher.department
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      teachers,
      search,
    ]);


  async function loadHistory(
    teacherId
  ) {
    try {
      const response =
        await api.get(
          `/admin/cards/teachers/${teacherId}/history`
        );

      const cards =
        response.data
          .cards ?? [];

      setHistory(cards);

      return cards;

    } catch (err) {
      console.error(
        "History load error:",
        err
      );

      setHistory([]);

      return [];
    }
  }


  async function loadBuilder(
    teacherId
  ) {
    try {
      const response =
        await api.get(
          `/admin/cards/teachers/${teacherId}/builder`
        );

      setBuilder(
        response.data.teacher
      );

      return response.data
        .teacher;

    } catch {
      setBuilder(null);

      return null;
    }
  }


  async function chooseTeacher(
    teacher
  ) {
    if (
      !teacher.statsFinalized
    ) {
      setError(
        "Finalize this professor's stats before entering the Card Forge."
      );

      return;
    }

    setSelectedTeacher(
      teacher
    );

    setSelectedCard(null);

    setRecommendations(null);

    setBuilder(null);

    setHistory([]);

    setError("");

    setMessage("");

    setLoadingForge(true);


    try {
      const [
        recommendationResponse,
        personalityResponse,
      ] =
        await Promise.all([
          api.get(
            `/admin/cards/teachers/${teacher.id}/recommendations`
          ),

          api.get(
            `/admin/cards/teachers/${teacher.id}/personality`
          ),
        ]);


      const recommendationData =
        recommendationResponse.data;

      const savedPersonality =
        personalityResponse.data
          .teacher;


      setRecommendations(
        recommendationData
      );


      const recommended =
        recommendationData
          .recommended;


      const firstMove =
        recommended
          ?.specialMoves?.[0];


      setPersonality({
        archetype:
          savedPersonality
            ?.archetype ||
          recommended
            ?.name ||
          "",

        specialMove:
          savedPersonality
            ?.specialMove ||
          firstMove
            ?.name ||
          "",

        specialMoveDescription:
          savedPersonality
            ?.specialMoveDescription ||
          firstMove
            ?.description ||
          "",
      });


      const cards =
        await loadHistory(
          teacher.id
        );


      await loadBuilder(
        teacher.id
      );


      if (
        cards.length > 0
      ) {
        setSelectedCard(
          cards[0]
        );
      }

    } catch (err) {
      console.error(
        "Forge load error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          "Unable to open the Card Forge."
      );

    } finally {
      setLoadingForge(false);
    }
  }


  function chooseArchetype(
    archetype
  ) {
    const firstMove =
      archetype
        .specialMoves?.[0];

    setPersonality({
      archetype:
        archetype.name,

      specialMove:
        firstMove?.name ??
        "",

      specialMoveDescription:
        firstMove?.description ??
        "",
    });

    setMessage("");
  }


  function chooseSpecialMove(
    move
  ) {
    setPersonality(
      (current) => ({
        ...current,

        specialMove:
          move.name,

        specialMoveDescription:
          move.description,
      })
    );
  }


  const selectedArchetypeObject =
    useMemo(() => {
      return (
        recommendations
          ?.allRecommendations
          ?.find(
            (item) =>
              item.name ===
              personality.archetype
          ) ?? null
      );
    }, [
      recommendations,
      personality.archetype,
    ]);


  async function savePersonality() {
    if (!selectedTeacher) {
      return false;
    }


    if (
      !personality.archetype.trim() ||
      !personality.specialMove.trim() ||
      !personality
        .specialMoveDescription
        .trim()
    ) {
      setError(
        "Archetype, special move and move description are required."
      );

      return false;
    }


    try {
      setSavingPersonality(
        true
      );

      setError("");

      await api.put(
        `/admin/cards/teachers/${selectedTeacher.id}/personality`,
        {
          archetype:
            personality
              .archetype
              .trim(),

          specialMove:
            personality
              .specialMove
              .trim(),

          specialMoveDescription:
            personality
              .specialMoveDescription
              .trim(),
        }
      );


      await loadBuilder(
        selectedTeacher.id
      );


      setMessage(
        "Personality saved."
      );

      return true;

    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to save personality."
      );

      return false;

    } finally {
      setSavingPersonality(
        false
      );
    }
  }


  async function generateCard() {
    if (!selectedTeacher) {
      return;
    }


    const saved =
      await savePersonality();


    if (!saved) {
      return;
    }


    try {
      setGenerating(true);

      setError("");

      const response =
        await api.post(
          `/admin/cards/teachers/${selectedTeacher.id}/generate`
        );


      const newCard =
        response.data.card;


      setSelectedCard(
        newCard
      );


      await loadHistory(
        selectedTeacher.id
      );


      setMessage(
        `Card variant v${newCard.version} forged successfully.`
      );

    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to generate card."
      );

    } finally {
      setGenerating(false);
    }
  }


  async function approveSelectedCard() {
    if (!selectedCard) {
      return;
    }


    try {
      setActionBusy(true);

      setError("");

      const response =
        await api.patch(
          `/admin/cards/${selectedCard.id}/approve`
        );


      setSelectedCard(
        response.data.card
      );


      await loadHistory(
        selectedTeacher.id
      );


      await loadBuilder(
        selectedTeacher.id
      );


      setMessage(
        `Card v${selectedCard.version} is now the official ProfessorDex card.`
      );

    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to approve card."
      );

    } finally {
      setActionBusy(false);
    }
  }


  async function rejectSelectedCard() {
    if (!selectedCard) {
      return;
    }


    try {
      setActionBusy(true);

      setError("");

      const response =
        await api.patch(
          `/admin/cards/${selectedCard.id}/reject`
        );


      setSelectedCard(
        response.data.card
      );


      await loadHistory(
        selectedTeacher.id
      );


      setMessage(
        `Card v${selectedCard.version} rejected. Generate another variant when ready.`
      );

    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to reject card."
      );

    } finally {
      setActionBusy(false);
    }
  }


  function closeForge() {
    setSelectedTeacher(
      null
    );

    setRecommendations(
      null
    );

    setBuilder(null);

    setHistory([]);

    setSelectedCard(null);

    setError("");

    setMessage("");
  }


  const previewSource =
    selectedCard ??
    builder;
  const activeSpecialMove =
  selectedCard
    ?.specialMove ??
  personality
    .specialMove ??
  builder
    ?.specialMove ??
  "";
  const builderScoreMap = {
  teachingAura:
    builder?.finalTeachingAura ?? 0,

  humourMeter:
    builder?.finalHumourMeter ?? 0,

  classroomVibe:
    builder?.finalClassroomVibe ?? 0,

  mentorEnergy:
    builder?.finalMentorEnergy ?? 0,

  classroomPresence:
    builder?.finalClassroomPresence ?? 0,
};


  const photoUrl =
    getPhotoUrl(
      builder?.photoUrl
    );

async function downloadOfficialCard() {
  if (
    !cardRef.current ||
    !selectedCard ||
    selectedCard.status !==
      "APPROVED"
  ) {
    return;
  }

  try {
    setError("");
    setMessage(
      "Preparing high-resolution card..."
    );

    const dataUrl =
      await toPng(
        cardRef.current,
        {
          cacheBust: true,
          pixelRatio: 3,
          backgroundColor:
            "#050814",
        }
      );

    const safeName =
      String(
        builder?.name ??
          "Professor"
      )
        .trim()
        .replace(
          /[^a-zA-Z0-9]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        );

    const link =
      document.createElement(
        "a"
      );

    link.download =
      `${safeName}-ProfessorDex-V${selectedCard.version}.png`;

    link.href =
      dataUrl;

    link.click();

    setMessage(
      "Official card exported successfully."
    );

  } catch (err) {
    console.error(
      "Card export error:",
      err
    );

    setError(
      "Unable to export the card image."
    );
  }
}


  return (
    <div className="card-forge-page">

      <header className="page-header">
        <div>
          <div className="eyebrow">
            <WandSparkles
              size={14}
            />

            ARCANE CARD ENGINE
          </div>

          <h1>
            Card Forge
          </h1>

          <p>
            Distill finalized professor
            stats into collectible
            ProfessorDex identities.
          </p>
        </div>

        <div className="forge-status-pill">
          <Flame size={15} />

          Forge Online
        </div>
      </header>


      {!selectedTeacher ? (
        <>
          <section className="forge-intro-panel">

            <div className="forge-intro-symbol">
              <Sparkles
                size={25}
              />
            </div>

            <div>
              <span>
                SELECT A SUBJECT
              </span>

              <h2>
                Choose a professor
                to awaken.
              </h2>

              <p>
                Only professors with
                finalized stats can
                enter the Card Forge.
              </p>
            </div>

          </section>


          <section className="forge-teacher-panel">

            <div className="forge-toolbar">

              <div>
                <span>
                  FACULTY CANDIDATES
                </span>

                <h2>
                  Forge Queue
                </h2>
              </div>


              <div className="forge-search">
                <Search
                  size={15}
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
                  placeholder="Search professor..."
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    <X
                      size={14}
                    />
                  </button>
                )}
              </div>

            </div>


            {loading ? (
              <div className="forge-empty-state">
                <div className="archive-loading-sigil">
                  PD
                </div>

                <p>
                  Opening the forge...
                </p>
              </div>
            ) : (
              <div className="forge-teacher-grid">

                {filteredTeachers.map(
                  (
                    teacher,
                    index
                  ) => (
                    <motion.button
                      key={
                        teacher.id
                      }
                      className={
                        teacher.statsFinalized
                          ? "forge-teacher-card ready"
                          : "forge-teacher-card"
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
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
                      onClick={() =>
                        chooseTeacher(
                          teacher
                        )
                      }
                    >

                      <div className="forge-teacher-orb">
                        <GraduationCap
                          size={20}
                        />
                      </div>


                      <div className="forge-teacher-copy">

                        <span>
                          {
                            teacher.statsFinalized
                              ? "FORGE READY"
                              : "STATS PENDING"
                          }
                        </span>

                        <h3>
                          {teacher.name}
                        </h3>

                        <p>
                          {
                            teacher.department
                          }
                        </p>

                      </div>


                      <div className="forge-teacher-side">

                        <strong>
                          {
                            teacher
                              ._count
                              ?.ratings ??
                            0
                          }
                        </strong>

                        <small>
                          ratings
                        </small>

                        <ChevronRight
                          size={15}
                        />

                      </div>

                    </motion.button>
                  )
                )}

              </div>
            )}

          </section>
        </>
      ) : (
        <>

          <div className="forge-workspace-top">

            <button
              className="forge-back-button"
              onClick={
                closeForge
              }
            >
              <X size={15} />

              Exit Forge
            </button>


            <div className="forge-professor-title">

              <span>
                CURRENT SUBJECT
              </span>

              <strong>
                {
                  selectedTeacher.name
                }
              </strong>

              <small>
                {
                  selectedTeacher.department
                }
              </small>

            </div>

          </div>


          {error && (
            <div className="archive-error">
              {error}
            </div>
          )}


          {message && (
            <motion.div
              className="forge-success-message"

              initial={{
                opacity: 0,
                y: -4,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <Check
                size={15}
              />

              {message}
            </motion.div>
          )}


          {loadingForge ? (
            <div className="forge-empty-state forge-loading-state">
              <div className="archive-loading-sigil">
                PD
              </div>

              <p>
                Reading the professor's
                aura...
              </p>
            </div>
          ) : (
            <div className="forge-workspace">


              {/* =========================
                  LEFT CONTROL PANEL
                  ========================= */}

              <div className="forge-controls">


                <section className="forge-section">

                  <div className="forge-section-heading">

                    <div>
                      <span>
                        STEP 01
                      </span>

                      <h2>
                        Archetype
                        Resonance
                      </h2>
                    </div>

                    <BarChart3
                      size={18}
                    />

                  </div>


                  <p className="forge-section-description">
                    ProfessorDex scores
                    every archetype using
                    the complete finalized
                    stat profile.
                  </p>


                  <div className="archetype-ranking">

                    {recommendations
                      ?.allRecommendations
                      ?.map(
                        (
                          archetype,
                          index
                        ) => (
                          <button
                            key={
                              archetype.id
                            }

                            className={
                              personality.archetype ===
                              archetype.name
                                ? "archetype-option selected"
                                : "archetype-option"
                            }

                            onClick={() =>
                              chooseArchetype(
                                archetype
                              )
                            }
                          >

                            <div className="archetype-rank">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>


                            <div className="archetype-info">

                              <strong>
                                {
                                  archetype.name
                                }
                              </strong>

                              <span>
                                {
                                  archetype.description ??
                                  "ProfessorDex archetype"
                                }
                              </span>

                            </div>


                            <div className="compatibility-score">
                              {
                                archetype.compatibilityScore
                              }
                            </div>

                          </button>
                        )
                      )}

                  </div>

                </section>


                <section className="forge-section">

                  <div className="forge-section-heading">

                    <div>
                      <span>
                        STEP 02
                      </span>

                      <h2>
                        Personality
                        Override
                      </h2>
                    </div>

                    <Crown
                      size={18}
                    />

                  </div>


                  <p className="forge-section-description">
                    Recommendations are
                    suggestions only. The
                    admin controls the
                    final card identity.
                  </p>


                  <div className="forge-form">

                    <label>
                      <span>
                        Archetype
                      </span>

                      <input
                        value={
                          personality.archetype
                        }
                        onChange={(
                          event
                        ) =>
                          setPersonality(
                            (
                              current
                            ) => ({
                              ...current,

                              archetype:
                                event.target.value,
                            })
                          )
                        }
                      />
                    </label>


                    {selectedArchetypeObject
                      ?.specialMoves
                      ?.length >
                      0 && (
                      <div className="move-suggestions">

                        <span>
                          RECOMMENDED MOVES
                        </span>

                        <div>
                          {selectedArchetypeObject
                            .specialMoves
                            .map(
                              (
                                move
                              ) => (
                                <button
                                  key={
                                    move.id
                                  }
                                  className={
                                    personality.specialMove ===
                                    move.name
                                      ? "selected"
                                      : ""
                                  }
                                  onClick={() =>
                                    chooseSpecialMove(
                                      move
                                    )
                                  }
                                >
                                  <Zap
                                    size={13}
                                  />

                                  {
                                    move.name
                                  }
                                </button>
                              )
                            )}
                        </div>

                      </div>
                    )}


                    <label>
                      <span>
                        Special Move
                      </span>

                      <input
                        value={
                          personality.specialMove
                        }
                        onChange={(
                          event
                        ) =>
                          setPersonality(
                            (
                              current
                            ) => ({
                              ...current,

                              specialMove:
                                event.target.value,
                            })
                          )
                        }
                      />
                    </label>


                    <label>
                      <span>
                        Move Description
                      </span>

                      <textarea
                        rows="4"
                        value={
                          personality
                            .specialMoveDescription
                        }
                        onChange={(
                          event
                        ) =>
                          setPersonality(
                            (
                              current
                            ) => ({
                              ...current,

                              specialMoveDescription:
                                event.target.value,
                            })
                          )
                        }
                      />
                    </label>


                    <button
                      className="forge-save-button"
                      onClick={
                        savePersonality
                      }
                      disabled={
                        savingPersonality
                      }
                    >
                      <Save
                        size={15}
                      />

                      {savingPersonality
                        ? "Saving..."
                        : "Save Personality"}
                    </button>

                  </div>

                </section>


                <section className="forge-section">

                  <div className="forge-section-heading">

                    <div>
                      <span>
                        STEP 03
                      </span>

                      <h2>
                        Generate Variant
                      </h2>
                    </div>

                    <Dices
                      size={18}
                    />

                  </div>


                  <p className="forge-section-description">
                    Every generation is
                    stored as a new
                    version with a
                    different visual
                    variant.
                  </p>


                  <button
                    className="forge-generate-button"
                    onClick={
                      generateCard
                    }
                    disabled={
                      generating
                    }
                  >
                    <Flame
                      size={17}
                    />

                    {generating
                      ? "Forging Card..."
                      : history.length ===
                        0
                      ? "Forge First Card"
                      : "Regenerate Variant"}
                  </button>

                </section>

              </div>


              {/* =========================
                  RIGHT PREVIEW PANEL
                  ========================= */}

              <div className="forge-preview-area">

                <div className="preview-heading">

                  <div>
                    <span>
                      LIVE ARTIFACT
                    </span>

                    <h2>
                      Card Preview
                    </h2>
                  </div>


                  {selectedCard && (
  <div className="preview-version premium-preview-version">

    <strong>
      V{selectedCard.version}
    </strong>

    <span>
      {selectedCard.variantKey
        .replaceAll("_", " ")}
    </span>

  </div>
)}

                </div>


                {previewSource ? (
                  <motion.div
                  ref={cardRef}
  key={
    selectedCard?.id ??
    "builder"
  }

  className={`professordex-card premium-dex-card ${getVariantClass(
    selectedCard?.variantKey
  )}`}

  initial={{
    opacity: 0,
    scale: 0.97,
    rotateY: -6,
  }}

  animate={{
    opacity: 1,
    scale: 1,
    rotateY: 0,
  }}

  transition={{
    duration: 0.45,
  }}
>

  {/* HOLOGRAPHIC EFFECTS */}

  <div className="dex-holo-sheen" />
  <div className="dex-circuit-layer" />
  <div className="dex-inner-frame" />


  {/* ===========================
      PROFESSORDEX HEADER
      =========================== */}

  <div className="premium-card-header">

    <div className="premium-logo">

      <div className="premium-logo-icon">
        <GraduationCap
          size={27}
        />
      </div>

      <div className="premium-brand">
        <strong>
          Professor<span>Dex</span>
        </strong>

        <small>
          COLLECT • APPRECIATE • INSPIRE
        </small>
      </div>

    </div>


    <div className="premium-edition">
      <span>
        FACULTY
      </span>

      <strong>
        EDITION
      </strong>
    </div>

  </div>


  {/* ===========================
      PROFESSOR IDENTITY
      =========================== */}

  <section className="premium-identity-section">

    <div className="premium-photo-frame">

      <div className="premium-photo-glow" />

      <div className="premium-photo-ring">

        {photoUrl ? (
          <img
            src={photoUrl}
            alt={
              builder?.name
            }
          />
        ) : (
          <GraduationCap
            size={54}
          />
        )}

      </div>

    </div>


    <div className="premium-profile-panel">

      <span className="profile-label">
        PROFESSOR PROFILE
      </span>

      <h2>
        {builder?.name}
      </h2>

      <p className="premium-department">
        {builder?.department}
      </p>


      <div className="premium-archetype">

        <Sparkles
          size={17}
        />

        <strong>
          {
            previewSource.archetype
          }
        </strong>

      </div>


      <div className="premium-description">

        <span>
          “
        </span>

        <p>
          {builder?.description ||
            "A faculty profile forged from anonymous student ratings and ProfessorDex analytics."}
        </p>

      </div>

    </div>

  </section>


  {/* ===========================
      STATS
      =========================== */}

  <section className="premium-stat-stack">

    {statsDefinition.map(
      (definition) => {

        const Icon =
          definition.icon;

        const score =
          previewSource?.[
            definition.key
          ] ??
          builderScoreMap[
            definition.key
          ] ??
          0;

        const title =
          previewSource?.[
            definition.titleKey
          ] ??
          builder?.[
            definition.titleKey
          ] ??
          "Unclassified";


        return (
          <div
            key={
              definition.key
            }

            className={`premium-stat-row stat-${definition.tone}`}
          >

            <div className="premium-stat-icon">

              <Icon
                size={26}
                strokeWidth={2.2}
              />

            </div>


            <div className="premium-stat-details">

              <span>
                {
                  definition.label
                }
              </span>

              <strong>
                {title}
              </strong>

            </div>


            <div className="premium-stat-score">
              {score}
            </div>


            <div className="premium-stat-track">

              <motion.div
                initial={{
                  width: 0,
                }}

                animate={{
                  width:
                    `${score}%`,
                }}

                transition={{
                  duration: 0.7,
                  delay: 0.15,
                }}
              />

            </div>

          </div>
        );
      }
    )}

  </section>


  {/* ===========================
      SPECIAL MOVE
      =========================== */}

  <section className="premium-special-move">

    <div className="premium-move-heading">

      <Sparkles
        size={18}
      />

      <span>
        SPECIAL MOVE
      </span>

    </div>


    <div className="premium-move-body">

      <div className="premium-move-copy">

        <h3>
          {
            previewSource
              .specialMove
          }
        </h3>

        <p>
          {
            previewSource
              .specialMoveDescription
          }
        </p>


        <div className="move-power-tags">

          <span>
            ✦ FACULTY SKILL
          </span>

          <span>
            ✦ SIGNATURE MOVE
          </span>

        </div>

      </div>


      <SpecialMoveVisual
  moveName={
    activeSpecialMove
  }
/>

    </div>

  </section>


  {/* ===========================
      FOOTER
      =========================== */}

  <div className="premium-card-footer">

    <span>
      {
        builder?.ratingCount ??
        selectedTeacher
          ?._count
          ?.ratings ??
        0
      }
      {" "}
      ANONYMOUS RATINGS
    </span>


    <strong>
      GOOD TEACHERS SHAPE
      BRIGHTER TOMORROWS
    </strong>


    <ShieldCheck
      size={18}
    />

  </div>


  {selectedCard?.status ===
    "APPROVED" && (

    <div className="premium-official-seal">

      <Crown
        size={18}
      />

      OFFICIAL CARD

    </div>

  )}

</motion.div>
                ) : (
                  <div className="forge-preview-placeholder">

                    <Sparkles
                      size={30}
                    />

                    <h3>
                      The card awaits.
                    </h3>

                    <p>
                      Save a personality
                      to awaken the live
                      preview.
                    </p>

                  </div>
                )}


                {selectedCard && (
                  <div className="card-review-actions">

                    <div className="selected-card-status">

                      <span>
                        STATUS
                      </span>

                      <strong
                        className={`card-status-${selectedCard.status.toLowerCase()}`}
                      >
                        {
                          selectedCard.status
                        }
                      </strong>

                    </div>


                    {selectedCard.status ===
                      "DRAFT" && (
                      <div className="card-action-buttons">

                        <button
                          className="reject-card-button"
                          onClick={
                            rejectSelectedCard
                          }
                          disabled={
                            actionBusy
                          }
                        >
                          <X
                            size={15}
                          />

                          Reject
                        </button>


                        <button
                          className="approve-card-button"
                          onClick={
                            approveSelectedCard
                          }
                          disabled={
                            actionBusy
                          }
                        >
                          <CheckCircle2
                            size={15}
                          />

                          Approve Official
                        </button>

                      </div>
                    )}

                    {selectedCard.status ===
                      "APPROVED" && (

                      <button
                        className="export-card-button"
                        onClick={
                        downloadOfficialCard
                        }
                      >

                        <Download
                          size={16}
                        />

                        Export PNG

                      </button>

)}

                  </div>
                )}


                <section className="forge-history">

                  <div className="forge-history-header">

                    <div>
                      <History
                        size={16}
                      />

                      <span>
                        CARD HISTORY
                      </span>
                    </div>


                    <strong>
                      {
                        history.length
                      }
                      {" "}
                      versions
                    </strong>

                  </div>


                  {history.length ===
                  0 ? (
                    <div className="history-empty">
                      No card variants
                      have been forged
                      yet.
                    </div>
                  ) : (
                    <div className="history-list">

                      {history.map(
                        (card) => (
                          <button
                            key={
                              card.id
                            }

                            className={
                              selectedCard
                                ?.id ===
                              card.id
                                ? "history-card selected"
                                : "history-card"
                            }

                            onClick={() =>
                              setSelectedCard(
                                card
                              )
                            }
                          >

                            <div
                              className={`history-variant-orb ${getVariantClass(
                                card.variantKey
                              )}`}
                            />


                            <div className="history-card-copy">

                              <strong>
                                Version
                                {" "}
                                {
                                  card.version
                                }
                              </strong>

                              <span>
                                {
                                  card.variantKey
                                }
                              </span>

                            </div>


                            <span
                              className={`history-status ${card.status.toLowerCase()}`}
                            >
                              {
                                card.status
                              }
                            </span>

                          </button>
                        )
                      )}

                    </div>
                  )}

                </section>

              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}

