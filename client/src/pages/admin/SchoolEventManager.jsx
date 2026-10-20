import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
  Trash2,
} from "lucide-react";
import api from "../../api/http";
import "../../styles/schoolEvent.css";

const emptyForm = {
  name: "",
  schoolName: "",
  photo: null,
};

const statusNames = {
  OPEN: "Accepting ratings",
  PAUSED: "Paused",
  FORGING: "Forging",
  COMPLETED: "Completed",
};

function photoSource(photoUrl) {
  if (!photoUrl) return null;

  if (/^https?:\/\//i.test(photoUrl)) {
    return photoUrl;
  }

  const origin = new URL(
    api.defaults.baseURL || window.location.origin,
    window.location.origin
  ).origin;

  return `${origin}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}

function errorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function SchoolEventManager() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTeachers = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);

    try {
      const response = await api.get(
        "/school-event/admin/teachers"
      );

      setTeachers(response.data.teachers || []);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers(true);
  }, [loadTeachers]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) =>
      `${teacher.name} ${teacher.schoolName} ${teacher.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [teachers, search]);

  const totals = useMemo(
    () => ({
      teachers: teachers.length,
      open: teachers.filter((t) => t.status === "OPEN").length,
      ratings: teachers.reduce(
        (sum, t) => sum + (t._count?.ratings || 0),
        0
      ),
      completed: teachers.filter(
        (t) => t.status === "COMPLETED"
      ).length,
    }),
    [teachers]
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setPreview(null);
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEdit(teacher) {
    setEditing(teacher);
    setForm({
      name: teacher.name,
      schoolName: teacher.schoolName,
      photo: null,
    });
    setPreview(null);
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setPreview(null);
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0] || null;

    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];

      if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        setError("Use a JPG, PNG or WebP image under 5 MB.");
        event.target.value = "";
        return;
      }
    }

    setForm((current) => ({ ...current, photo: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
    setError("");
  }

  async function saveTeacher(event) {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    const schoolName = form.schoolName.trim();

    if (!name || !schoolName) {
      setError("Teacher name and school name are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", name);
      data.append("schoolName", schoolName);

      if (form.photo) {
        data.append("photo", form.photo);
      }

      const config = {
        headers: { "Content-Type": undefined },
      };

      if (editing) {
        await api.patch(
          `/school-event/admin/teachers/${editing.id}`,
          data,
          config
        );
      } else {
        await api.post(
          "/school-event/admin/teachers",
          data,
          config
        );
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPreview(null);
      setNotice(
        editing ? "Teacher updated successfully." : "School teacher added."
      );
      await loadTeachers();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }


async function deleteTeacher(teacher) {
  if (busyId) return;

  const confirmed = window.confirm(
    `Delete ${teacher.name} from ${teacher.schoolName}?\n\nThis permanently deletes the teacher, all collected ratings, and any forged card. This cannot be undone.`
  );

  if (!confirmed) return;

  setBusyId(teacher.id);
  setError("");
  setNotice("");

  try {
    await api.delete(
      `/school-event/admin/teachers/${teacher.id}`
    );

    if (editing?.id === teacher.id) {
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPreview(null);
    }

    setNotice(
      `${teacher.name} and their card/ratings were deleted.`
    );

    await loadTeachers();
  } catch (err) {
    setError(errorMessage(err));
  } finally {
    setBusyId(null);
  }
}


  async function changeStatus(teacher) {
    if (busyId) return;

    const nextStatus = teacher.status === "OPEN" ? "PAUSED" : "OPEN";

    setBusyId(teacher.id);
    setError("");
    setNotice("");

    try {
      await api.patch(
        `/school-event/admin/teachers/${teacher.id}/status`,
        { status: nextStatus }
      );

      setNotice(
        nextStatus === "OPEN"
          ? `${teacher.name} is accepting ratings again.`
          : `Ratings paused for ${teacher.name}.`
      );

      await loadTeachers();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function checkForge(teacher) {
  if (busyId) return;

  setBusyId(teacher.id);
  setError("");
  setNotice("");

  try {
    const eligibility = await api.get(
      `/school-event/admin/teachers/${teacher.id}/forge-eligibility`
    );

    if (!eligibility.data.canForge) {
      setNotice(
        `${teacher.name} needs ${eligibility.data.remainingRatings} more ratings, or is no longer eligible for forging.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Forge ${teacher.name}'s card using ${eligibility.data.ratingCount} ratings?\n\nThis will finalize the stats and stop further ratings for this teacher.`
    );

    if (!confirmed) return;

    const response = await api.post(
      `/school-event/admin/teachers/${teacher.id}/forge`
    );

    setNotice(
      `${teacher.name}'s card forged successfully using ${response.data.ratingCount} ratings!`
    );

    await loadTeachers();
  } catch (err) {
    setError(errorMessage(err));
  } finally {
    setBusyId(null);
  }
}
  return (
    <div className="school-manager">
      <header className="school-heading">
        <div>
          <span className="school-eyebrow">
            <Sparkles size={15} /> PROFESSORDEX · SCHOOL EVENT
          </span>
          <h1>School Event Control</h1>
          <p>
            Manage school teachers, collect anonymous ratings,
            and prepare legends for the forge.
          </p>
        </div>

        <div className="school-heading-actions">
          <button
            className="school-btn school-btn-ghost"
            onClick={() => loadTeachers(true)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            className="school-btn school-btn-primary"
            onClick={openCreate}
          >
            <Plus size={17} />
            Add Teacher
          </button>
        </div>
      </header>

      <div className="school-metrics">
        {[
          ["School Teachers", totals.teachers, GraduationCap],
          ["Open for Ratings", totals.open, Play],
          ["Ratings Collected", totals.ratings, Users],
          ["Completed Cards", totals.completed, CheckCircle2],
        ].map(([label, value, Icon]) => (
          <div className="school-metric" key={label}>
            <Icon size={19} />
            <strong>{loading ? "—" : value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="school-alert school-alert-error" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="school-alert school-alert-success" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="school-list-panel">
        <div className="school-list-heading">
          <div>
            <span className="school-eyebrow">TEACHER REGISTRY</span>
            <h2>School Faculty</h2>
          </div>

          <div className="school-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teachers or schools..."
              aria-label="Search school teachers"
            />
          </div>
        </div>

        {loading ? (
          <div className="school-empty">
            <LoaderCircle className="school-spin" size={26} />
            Loading school teachers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="school-empty">
            <GraduationCap size={38} />
            <h3>{search ? "No matching teachers" : "No teachers yet"}</h3>
            <p>
              {search
                ? "Try another name or school."
                : "Add your first school teacher to begin collecting ratings."}
            </p>
          </div>
        ) : (
          <div className="school-teacher-grid">
            {filtered.map((teacher) => {
              const count = teacher._count?.ratings || 0;
              const eligible =
                count >= 5 &&
                ["OPEN", "PAUSED"].includes(teacher.status);

              return (
                <article className="school-teacher-card" key={teacher.id}>
                  <div className="school-teacher-top">
                    <div className="school-avatar">
                      {teacher.photoUrl ? (
                        <img
                          src={photoSource(teacher.photoUrl)}
                          alt={teacher.name}
                        />
                      ) : (
                        <GraduationCap size={28} />
                      )}
                    </div>
                    <span
                      className={`school-status school-status-${teacher.status.toLowerCase()}`}
                    >
                      <span />
                      {statusNames[teacher.status] || teacher.status}
                    </span>
                  </div>

                  <h3>{teacher.name}</h3>
                  <p className="school-schoolname">{teacher.schoolName}</p>

                  <div className="school-rating-progress">
                    <div>
                      <span>Anonymous Ratings</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="school-progress-track">
                      <div
                        style={{
                          width: `${Math.min(100, (count / 5) * 100)}%`,
                        }}
                      />
                    </div>
                    <small>
                      {count >= 5
                        ? "Minimum forge requirement met"
                        : `${5 - count} more to unlock forging`}
                    </small>
                  </div>

                  <div className="school-card-actions">
                    <button
                      className="school-btn school-btn-ghost"
                      onClick={() => openEdit(teacher)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    
<button
  className="school-btn school-btn-danger"
  disabled={busyId !== null}
  onClick={() => deleteTeacher(teacher)}
  title="Permanently delete this teacher, ratings, and card"
>
  <Trash2 size={15} />
  {busyId === teacher.id ? "Deleting..." : "Delete"}
</button>


                    {["OPEN", "PAUSED"].includes(teacher.status) && (
                      <button
                        className="school-btn school-btn-ghost"
                        disabled={busyId !== null}
                        onClick={() => changeStatus(teacher)}
                      >
                        {teacher.status === "OPEN" ? (
                          <Pause size={15} />
                        ) : (
                          <Play size={15} />
                        )}
                        {teacher.status === "OPEN" ? "Pause" : "Resume"}
                      </button>
                    )}

                    {teacher.status !== "COMPLETED" && (
                      <button
                        className="school-btn school-btn-forge"
                        disabled={busyId !== null || !eligible}
                        onClick={() => checkForge(teacher)}
                        title={
                          eligible
                            ? "Check card forge eligibility"
                            : "At least five ratings are required"
                        }
                      >
                        <Sparkles size={15} />
                        Forge Card
                      </button>
                    )}

                    {teacher.status === "COMPLETED" && (
                      <span className="school-completed-label">
                        <CheckCircle2 size={16} />
                        Card completed
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {formOpen && (
        <div
          className="school-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className="school-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit school teacher" : "Add school teacher"}
          >
            <div className="school-modal-heading">
              <div>
                <span className="school-eyebrow">FACULTY RECORD</span>
                <h2>{editing ? "Edit Teacher" : "Add School Teacher"}</h2>
              </div>
              <button
                className="school-icon-button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTeacher}>
              <label className="school-field">
                Teacher Name
                <input
                  required
                  maxLength={160}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Enter teacher's name"
                />
              </label>

              <label className="school-field">
                School Name
                <input
                  required
                  maxLength={160}
                  value={form.schoolName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      schoolName: e.target.value,
                    }))
                  }
                  placeholder="Enter school name"
                />
              </label>

              <label className="school-field">
                Teacher Photo (Optional)
                <div className="school-photo-picker">
                  <div className="school-avatar school-avatar-large">
                    {preview || editing?.photoUrl ? (
                      <img
                        src={preview || photoSource(editing.photoUrl)}
                        alt="Teacher preview"
                      />
                    ) : (
                      <Camera size={28} />
                    )}
                  </div>
                  <div>
                    <strong>Choose a photograph</strong>
                    <p>JPG, PNG or WebP · Maximum 5 MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={choosePhoto}
                    />
                  </div>
                </div>
              </label>

              <div className="school-modal-actions">
                <button
                  type="button"
                  className="school-btn school-btn-ghost"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="school-btn school-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}