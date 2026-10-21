import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Download,
  Expand,
  GraduationCap,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  X,
  Trash2,
} from "lucide-react";
import { toPng } from "html-to-image";
import api from "../../api/http";
import "../../styles/schoolHall.css";
import SchoolOfficialCard from "../../components/school/SchoolOfficialCard";
const stats = [
  ["teachingAura", "teachingAuraTitle", "Teaching Aura"],
  ["humourMeter", "humourMeterTitle", "Humour Meter"],
  ["classroomVibe", "classroomVibeTitle", "Classroom Vibe"],
  ["mentorEnergy", "mentorEnergyTitle", "Mentor Energy"],
  ["classroomPresence", "classroomPresenceTitle", "Classroom Presence"],
];

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;

  const origin = new URL(
    api.defaults.baseURL || window.location.origin,
    window.location.origin
  ).origin;

  return `${origin}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}

function getError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load the Hall of Legends."
  );
}

function LegendCard({ card, cardRef }) {
  return (
    <SchoolOfficialCard
      card={card}
      cardRef={cardRef}
    />
  );
}

export default function SchoolHallOfLegends() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  
const [exporting, setExporting] = useState(false);
const [deletingId, setDeletingId] = useState(null);
const [notice, setNotice] = useState("");
const [fullscreen, setFullscreen] = useState(false);


  const galleryRef = useRef(null);
  const exportRef = useRef(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/school-event/admin/cards");
      setCards(response.data.cards || []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    function onKeyDown(event) {
      if (selectedIndex === null) return;

      if (event.key === "Escape") {
        setSelectedIndex(null);
      } else if (event.key === "ArrowRight") {
        setSelectedIndex((i) => (i + 1) % cards.length);
      } else if (event.key === "ArrowLeft") {
        setSelectedIndex((i) => (i - 1 + cards.length) % cards.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, cards.length]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener(
        "fullscreenchange",
        onFullscreenChange
      );
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await galleryRef.current?.requestFullscreen();
      }
    } catch (err) {
      setError(getError(err));
    }
  }

  async function exportCard(card) {
    if (exporting || !exportRef.current) return;

    setExporting(true);
    setError("");

    try {
      await document.fonts.ready;

      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#080d1d",
      });

      const link = document.createElement("a");
      const safeName = (card.teacher?.name || "school-teacher")
        .replace(/[^a-z0-9_-]+/gi, "-");

      link.download = `${safeName}-ProfessorDex.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError(
        `PNG export failed. Check photo hosting/CORS permissions. ${getError(err)}`
      );
    } finally {
      setExporting(false);
    }
  }


async function deleteCard(card) {
  if (!card || deletingId !== null) return;

  const teacherName = card.teacher?.name || "this teacher";

  const confirmed = window.confirm(
    `Delete the forged card for ${teacherName}?\n\nOnly the card will be deleted. The teacher and collected ratings will remain, and the teacher will return to Paused so you can forge a new card later.`
  );

  if (!confirmed) return;

  setDeletingId(card.id);
  setError("");
  setNotice("");

  const deletedIndex = cards.findIndex(
    (item) => item.id === card.id
  );

  try {
    await api.delete(
      `/school-event/admin/cards/${card.id}`
    );

    setCards((current) =>
      current.filter((item) => item.id !== card.id)
    );

    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === undefined) {
        return null;
      }

      if (currentIndex === deletedIndex) return null;

      return currentIndex > deletedIndex
        ? currentIndex - 1
        : currentIndex;
    });

    setNotice(
      `Deleted ${teacherName}'s card. The teacher and ratings were kept.`
    );
  } catch (err) {
    setError(getError(err));
  } finally {
    setDeletingId(null);
  }
}


  const selectedCard =
    selectedIndex !== null ? cards[selectedIndex] : null;

  return (
    <div className="sh-page" ref={galleryRef}>
      <header className="sh-heading">
        <div>
          <span className="sh-eyebrow">
            <Crown size={16} />
            PROFESSORDEX · SCHOOL EVENT
          </span>
          <h1>Hall of Legends</h1>
          <p>
            Every completed school teacher card, gathered in one place.
          </p>
        </div>

        <div className="sh-heading-actions">
          <button onClick={loadCards} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setSelectedIndex(0)}
            disabled={!cards.length}
          >
            <Expand size={16} />
            Present Cards
          </button>
        </div>
      </header>

      <div className="sh-summary">
        <Crown size={21} />
        <strong>{cards.length}</strong>
        <span>Legends Forged</span>
      </div>

      {error && (
        <div className="sh-error" role="alert">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}


{notice && (
  <div className="sh-notice" role="status">
    {notice}
    <button
      onClick={() => setNotice("")}
      aria-label="Dismiss notice"
    >
      <X size={16} />
    </button>
  </div>
)}



      {loading ? (
        <div className="sh-empty">Loading legendary cards...</div>
      ) : cards.length === 0 ? (
        <div className="sh-empty">
          <GraduationCap size={43} />
          <h2>The Hall Awaits Its First Legend</h2>
          <p>Forge a school teacher card to see it here.</p>
        </div>
      ) : (
        <div className="sh-gallery">
          {cards.map((card, index) => (
            <div className="sh-gallery-item" key={card.id}>
              <LegendCard card={card} />

              <div className="sh-gallery-actions">
                <button onClick={() => setSelectedIndex(index)}>
                  <Maximize2 size={16} />
                  View
                </button>
                <button
                  disabled={exporting}
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                >
                  <Download size={16} />
                  Export
                </button>
                
<button
  className="sh-delete-button"
  disabled={exporting || deletingId !== null}
  onClick={() => deleteCard(card)}
>
  <Trash2 size={16} />
  {deletingId === card.id ? "Deleting..." : "Delete"}
</button>

              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <div className="sh-presentation" role="dialog" aria-modal="true">
          <div className="sh-presentation-toolbar">
            <span>
              LEGEND {selectedIndex + 1} OF {cards.length}
            </span>

            <div>
              <button
                onClick={() => exportCard(selectedCard)}
                disabled={exporting}
              >
                <Download size={17} />
                {exporting ? "Exporting..." : "Download PNG"}
              </button>

              <button onClick={toggleFullscreen}>
                {fullscreen ? (
                  <Minimize2 size={17} />
                ) : (
                  <Maximize2 size={17} />
                )}
                {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>

              <button
                onClick={() => setSelectedIndex(null)}
                aria-label="Close presentation"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="sh-presentation-content">
            <button
              className="sh-slide-arrow"
              aria-label="Previous card"
              onClick={() =>
                setSelectedIndex(
                  (selectedIndex - 1 + cards.length) % cards.length
                )
              }
            >
              <ArrowLeft />
            </button>

            <div className="sh-presentation-card">
              <LegendCard card={selectedCard} cardRef={exportRef} />
            </div>

            <button
              className="sh-slide-arrow"
              aria-label="Next card"
              onClick={() =>
                setSelectedIndex((selectedIndex + 1) % cards.length)
              }
            >
              <ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}