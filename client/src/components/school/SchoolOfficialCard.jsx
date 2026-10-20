import {
  BarChart3,
  CheckCircle2,
  Crown,
  Flame,
  GraduationCap,
  ShieldCheck,
  Smile,
  Snowflake,
  Sparkles,
  Sprout,
  Swords,
  UsersRound,
  WandSparkles,
  Zap,
} from "lucide-react";

import api from "../../api/http";
import "../../styles/schoolOfficialCard.css";

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

// Same special-move visual associations as college CardForge.
const moveVisuals = {
  "Concept Liberation: Final Form": ["concept-liberation", GraduationCap],
  "Infinite Knowledge": ["infinite-knowledge", Sparkles],
  "Comedy Domain: Infinite One-Liners": ["comedy-domain", Smile],
  "Domain Expansion: Absolute Chill": ["absolute-chill", Snowflake],
  "Guidance Overdrive": ["guidance-overdrive", Sprout],
  "Conqueror's Presence": ["conquerors-presence", Crown],
  "Domain Expansion: Complete Silence": ["complete-silence", ShieldCheck],
  "Ultimate Technique: Perfect Balance": ["perfect-balance", Sparkles],
  "Concept Transmutation": ["concept-transmutation", WandSparkles],
  "The Grand Reveal": ["grand-reveal", Sparkles],
  "Knowledge Shockwave": ["knowledge-shockwave", Zap],
  "Master Plan": ["master-plan", BarChart3],
  "Safety Net": ["safety-net", ShieldCheck],
  "Flawless Deduction": ["flawless-deduction", CheckCircle2],
  "Future Insight": ["future-insight", Sparkles],
  "Legendary Lecture": ["legendary-lecture", Crown],
  "Clarity Burst": ["clarity-burst", Zap],
  "Inspiration Surge": ["inspiration-surge", Flame],
  "Wisdom Blueprint": ["wisdom-blueprint", GraduationCap],
  "Legendary Delivery": ["legendary-delivery", Swords],
};

function photoUrl(value) {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;

  const origin = new URL(
    api.defaults.baseURL || window.location.origin,
    window.location.origin
  ).origin;

  return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
}

function StaticSpecialMove({ moveName }) {
  const [effect, Icon] = moveVisuals[moveName] || [
    "default-vortex",
    Swords,
  ];

  return (
    <div className={`special-move-visual move-effect-${effect}`}>
      <div className="move-effect-aura" />

      <div className="move-effect-ring move-effect-ring-one" />
      <div className="move-effect-ring move-effect-ring-two" />
      <div className="move-effect-ring move-effect-ring-three" />

      <div className="move-effect-axis move-effect-axis-one" />
      <div className="move-effect-axis move-effect-axis-two" />

      {[1, 2, 3, 4, 5, 6].map((number) => (
        <span
          key={number}
          className={`move-effect-particle particle-${[
            "one", "two", "three", "four", "five", "six",
          ][number - 1]}`}
        />
      ))}

      <div className="move-effect-core">
        <Icon size={34} strokeWidth={1.8} />
      </div>
    </div>
  );
}

export default function SchoolOfficialCard({ card, cardRef }) {
  if (!card) return null;

  const teacher = card.teacher || {};
  const variant = (card.variantKey || "NEON_BLUE")
    .toLowerCase()
    .replaceAll("_", "-");

  return (
    <div
      ref={cardRef}
      className={`professordex-card premium-dex-card card-variant-${variant} school-static-card`}
    >
      {/* Same decorative layers as the college card.
          Holographic movement is disabled by school CSS. */}
      <div className="dex-circuit-layer" />
      <div className="dex-inner-frame" />

      <div className="premium-card-header">
        <div className="premium-logo">
          <div className="premium-logo-icon">
            <GraduationCap size={27} />
          </div>

          <div className="premium-brand">
            <strong>
              Professor<span>Dex</span>
            </strong>
            <small>COLLECT • APPRECIATE • INSPIRE</small>
          </div>
        </div>

        <div className="premium-edition">
          <span>SCHOOL</span>
          <strong>EDITION</strong>
        </div>
      </div>

      <section className="premium-identity-section">
        <div className="premium-photo-frame">
          <div className="premium-photo-glow" />

          <div className="premium-photo-ring">
            {teacher.photoUrl ? (
              <img
                src={photoUrl(teacher.photoUrl)}
                alt={teacher.name || "Teacher"}
                crossOrigin="anonymous"
              />
            ) : (
              <GraduationCap size={54} />
            )}
          </div>
        </div>

        <div className="premium-profile-panel">
          <span className="profile-label">
            TEACHER PROFILE
          </span>

          <h2>{teacher.name || "Unknown Teacher"}</h2>

          <p className="premium-department">
            {teacher.schoolName || "School Event"}
          </p>

          <div className="premium-archetype">
            <Sparkles size={17} />
            <strong>{card.archetype}</strong>
          </div>

          <div className="premium-description">
            <span>“</span>
            <p>
              A legendary teacher profile forged from
              anonymous student ratings and ProfessorDex
              analytics.
            </p>
          </div>
        </div>
      </section>

      <section className="premium-stat-stack">
        {statsDefinition.map((definition) => {
          const Icon = definition.icon;
          const score = Math.max(
            0,
            Math.min(100, Number(card[definition.key]) || 0)
          );

          return (
            <div
              key={definition.key}
              className={`premium-stat-row stat-${definition.tone}`}
            >
              <div className="premium-stat-icon">
                <Icon size={26} strokeWidth={2.2} />
              </div>

              <div className="premium-stat-details">
                <span>{definition.label}</span>
                <strong>
                  {card[definition.titleKey] || "Unclassified"}
                </strong>
              </div>

              <div className="premium-stat-score">
                {score}
              </div>

              {/* Static bar: no Framer Motion */}
              <div className="premium-stat-track">
                <div style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      <section className="premium-special-move">
        <div className="premium-move-heading">
          <Sparkles size={18} />
          <span>SPECIAL MOVE</span>
        </div>

        <div className="premium-move-body">
          <div className="premium-move-copy">
            <h3>{card.specialMove}</h3>
            <p>{card.specialMoveDescription}</p>

            <div className="move-power-tags">
              <span>✦ FACULTY SKILL</span>
              <span>✦ SIGNATURE MOVE</span>
            </div>
          </div>

          <StaticSpecialMove moveName={card.specialMove} />
        </div>
      </section>

      <div className="premium-card-footer">
        <span>ANONYMOUS STUDENT RATINGS</span>

        <strong>
          GOOD TEACHERS SHAPE BRIGHTER TOMORROWS
        </strong>

        <ShieldCheck size={18} />
      </div>

      {/* Same official ribbon as the college card */}
      {teacher.status === "COMPLETED" && (
        <div className="premium-official-seal">
          <Crown size={18} />
          OFFICIAL CARD
        </div>
      )}
    </div>
  );
}