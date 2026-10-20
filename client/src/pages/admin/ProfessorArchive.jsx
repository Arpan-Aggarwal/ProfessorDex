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
  Archive,
  Camera,
  Edit3,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import api from "../../api/http";

const BACKEND_ORIGIN = "http://localhost:5000";

function getPhotoUrl(photoUrl) {
  if (!photoUrl) {
    return null;
  }

  const normalizedPath =
    String(photoUrl)
      .trim()
      .replace(/\\/g, "/");

  // Already a complete URL
  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  return `${BACKEND_ORIGIN}${
    normalizedPath.startsWith("/")
      ? ""
      : "/"
  }${normalizedPath}`;
}

function getTeacherSemesterIds(teacher) {
  if (!teacher?.semesters) {
    return [];
  }

  return teacher.semesters
    .map((item) => {
      if (item.semesterId) {
        return item.semesterId;
      }

      if (item.semester?.id) {
        return item.semester.id;
      }

      return null;
    })
    .filter(Boolean);
}


function getSemesterNames(teacher) {
  if (!teacher?.semesters) {
    return [];
  }

  return teacher.semesters
    .map((item) => {
      if (item.semester?.name) {
        return item.semester.name;
      }

      if (item.name) {
        return item.name;
      }

      return null;
    })
    .filter(Boolean);
}


export default function ProfessorArchive() {
  const [
    teachers,
    setTeachers,
  ] = useState([]);

  const [
    semesters,
    setSemesters,
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
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingTeacher,
    setEditingTeacher,
  ] = useState(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    department: "",
    description: "",
    semesterIds: [],
    photo: null,
  });

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState(null);


  async function loadData() {
    try {
      setLoading(true);

      const [
        teacherResponse,
        semesterResponse,
      ] = await Promise.all([
        api.get(
          "/admin/teachers"
        ),

        api.get(
          "/admin/ratings/semesters"
        ),
      ]);

      const teacherData =
        teacherResponse.data.teachers ??
        teacherResponse.data ??
        [];

      const semesterData =
        semesterResponse.data.semesters ??
        [];

      setTeachers(
        Array.isArray(teacherData)
          ? teacherData
          : []
      );

      setSemesters(
        semesterData
      );

    } catch (err) {
      console.error(
        "Professor archive load error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load Professor Archive."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
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
  (teacher) => {
    const name =
      teacher.name
        ?.toLowerCase() ?? "";

    const department =
      teacher.department
        ?.toLowerCase() ?? "";

    const tag =
      teacher.tag
        ?.toLowerCase() ?? "";

    return (
      name.includes(query) ||
      department.includes(query) ||
      tag.includes(query)
    );
  }
);
    }, [
      teachers,
      search,
    ]);


  function resetForm() {
    setForm({
      name: "",
      department: "",
      description: "",
      semesterIds: [],
      photo: null,
    });

    setPhotoPreview(null);
    setEditingTeacher(null);
    setError("");
  }


  function openCreateModal() {
    resetForm();
    setModalOpen(true);
  }


  function openEditModal(
    teacher
  ) {
    setEditingTeacher(
      teacher
    );

    setForm({
      name:
        teacher.name ?? "",

      department:
        teacher.department ?? "",

      description:
        teacher.description ?? "",

      semesterIds:
        getTeacherSemesterIds(
          teacher
        ),

      photo: null,
    });

    setPhotoPreview(
      getPhotoUrl(
        teacher.photoUrl
      )
    );

    setError("");
    setModalOpen(true);
  }


  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);

    setTimeout(() => {
      resetForm();
    }, 200);
  }


  function toggleSemester(
    semesterId
  ) {
    setForm((current) => {
      const alreadySelected =
        current.semesterIds.includes(
          semesterId
        );

      return {
        ...current,

        semesterIds:
          alreadySelected
            ? current.semesterIds.filter(
                (id) =>
                  id !== semesterId
              )
            : [
                ...current.semesterIds,
                semesterId,
              ],
      };
    });
  }


  function handlePhotoChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setForm((current) => ({
      ...current,
      photo: file,
    }));

    setPhotoPreview(
      URL.createObjectURL(
        file
      )
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      !form.name.trim() ||
      !form.department.trim()
    ) {
      setError(
        "Professor name and department are required."
      );

      return;
    }


    if (
      form.semesterIds.length === 0
    ) {
      setError(
        "Select at least one semester."
      );

      return;
    }


    const data =
      new FormData();

    data.append(
      "name",
      form.name.trim()
    );

    data.append(
      "department",
      form.department.trim()
    );

    data.append(
      "description",
      form.description.trim()
    );

    data.append(
      "semesterIds",
      JSON.stringify(
        form.semesterIds
      )
    );

    if (form.photo) {
      data.append(
        "photo",
        form.photo
      );
    }


    try {
      setSubmitting(true);

      if (editingTeacher) {
        await api.put(
          `/admin/teachers/${editingTeacher.id}`,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(
          "/admin/teachers",
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      await loadData();

      setModalOpen(false);

      setTimeout(() => {
        resetForm();
      }, 200);

    } catch (err) {
      console.error(
        "Professor save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to save professor."
      );

    } finally {
      setSubmitting(false);
    }
  }


  async function deleteTeacher(
  teacher
) {
  const confirmed =
    window.confirm(
      `PERMANENTLY delete ${teacher.name}${
        teacher.tag
          ? ` (${teacher.tag})`
          : ""
      }?\n\nThis will permanently remove the professor, all ratings, semester assignments and generated cards.\n\nThis cannot be undone.`
    );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(
      `/admin/teachers/${teacher.id}`
    );

    await loadData();

  } catch (err) {
    console.error(
      "Professor delete error:",
      err
    );

    window.alert(
      err?.response?.data?.message ||
      "Unable to delete professor."
    );
  }
}


  const totalRatings =
    teachers.reduce(
      (
        total,
        teacher
      ) =>
        total +
        (
          teacher._count
            ?.ratings ?? 0
        ),
      0
    );


  return (
    <div className="professor-page">

      <header className="page-header professor-header">
        <div>
          <div className="eyebrow">
            <Sparkles
              size={14}
            />

            FACULTY ARCHIVE
          </div>

          <h1>
            Professor Archive
          </h1>

          <p>
            Build and manage the
            faculty profiles that
            power ProfessorDex.
          </p>
        </div>

        <button
          className="archive-primary-button"
          onClick={
            openCreateModal
          }
        >
          <Plus size={17} />

          Add Professor
        </button>
      </header>


      <section className="archive-overview">

        <div className="archive-stat">
          <div className="archive-stat-icon">
            <GraduationCap
              size={20}
            />
          </div>

          <div>
            <span>
              Professors
            </span>

            <strong>
              {teachers.length}
            </strong>
          </div>
        </div>


        <div className="archive-stat">
          <div className="archive-stat-icon">
            <Users
              size={20}
            />
          </div>

          <div>
            <span>
              Semesters
            </span>

            <strong>
              {semesters.length}
            </strong>
          </div>
        </div>


        <div className="archive-stat">
          <div className="archive-stat-icon">
            <Sparkles
              size={20}
            />
          </div>

          <div>
            <span>
              Anonymous Ratings
            </span>

            <strong>
              {totalRatings}
            </strong>
          </div>
        </div>

      </section>


      <section className="archive-toolbar">

        <div className="archive-search">
          <Search
            size={17}
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
            placeholder="Search professor or department..."
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              <X size={15} />
            </button>
          )}
        </div>


        <div className="archive-result-count">
          {filteredTeachers.length}
          {" "}
          profiles found
        </div>

      </section>


      {error && !modalOpen && (
        <div className="archive-error">
          {error}
        </div>
      )}


      {loading ? (
        <div className="archive-loading">
          <div className="archive-loading-sigil">
            PD
          </div>

          <p>
            Opening the faculty
            archive...
          </p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="archive-empty">
          <div className="archive-empty-icon">
            <Archive size={30} />
          </div>

          <h2>
            No professors found
          </h2>

          <p>
            {search
              ? "No faculty profile matches your search."
              : "The archive is empty. Add your first professor."}
          </p>

          {!search && (
            <button
              className="archive-secondary-button"
              onClick={
                openCreateModal
              }
            >
              <Plus size={16} />

              Create First Profile
            </button>
          )}
        </div>
      ) : (
        <motion.section
          className="professor-grid"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
        >

          {filteredTeachers.map(
            (
              teacher,
              index
            ) => {

              const semesterNames =
                getSemesterNames(
                  teacher
                );

              const photo =
                getPhotoUrl(
                  teacher.photoUrl
                );

              return (
                <motion.article
                  className="professor-card"
                  key={
                    teacher.id
                  }
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index *
                      0.04,
                  }}
                >

                  <div className="professor-card-energy" />

                  <div className="professor-photo-wrap">

                    {photo ? (
                      <img
                      src={photo}
                      alt={teacher.name}
                      className="professor-photo"
                      />) : (
                      <div className="professor-photo-placeholder">
                        <UserRound
                          size={30}
                        />
                      </div>
                    )}

                    <span className="professor-status-dot" />

                  </div>


                  <div className="professor-card-content">

                    <div className="professor-card-top">

                      <span className="faculty-index">
                        FACULTY //
                        {" "}
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div className="professor-actions">

                        <button
                          title="Edit professor"
                          onClick={() =>
                            openEditModal(
                              teacher
                            )
                          }
                        >
                          <Edit3
                            size={15}
                          />
                        </button>

                        <button
                            title="Permanently delete professor"
                            className="danger-action"
                            onClick={() =>
                              deleteTeacher(
                                teacher
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>

                      </div>

                    </div>


                    <h2>
  {teacher.name}
</h2>

{teacher.tag && (
  <span className="professor-unique-tag">
    {teacher.tag}
  </span>
)}

<p className="professor-department">
  {teacher.department}
</p>


                    {teacher.description && (
                      <p className="professor-description">
                        {
                          teacher.description
                        }
                      </p>
                    )}


                    <div className="semester-tags">

                      {semesterNames.map(
                        (name) => (
                          <span
                            key={
                              name
                            }
                          >
                            {name}
                          </span>
                        )
                      )}

                    </div>


                    <div className="professor-card-footer">

                      <div>
                        <span>
                          RATINGS
                        </span>

                        <strong>
                          {
                            teacher
                              ._count
                              ?.ratings ??
                            0
                          }
                        </strong>
                      </div>


                      <div>
                        <span>
                          CARDS
                        </span>

                        <strong>
                          {
                            teacher
                              ._count
                              ?.cards ??
                            0
                          }
                        </strong>
                      </div>


                      <div>
                        <span>
                          STATUS
                        </span>

                        <strong className="active-status">
                          Active
                        </strong>
                      </div>

                    </div>

                  </div>

                </motion.article>
              );
            }
          )}

        </motion.section>
      )}


      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="faculty-modal-backdrop"

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            exit={{
              opacity: 0,
            }}

            onMouseDown={
              closeModal
            }
          >

            <motion.div
              className="faculty-modal"

              initial={{
                opacity: 0,
                scale: 0.96,
                y: 18,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.97,
                y: 12,
              }}

              transition={{
                duration: 0.2,
              }}

              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              <div className="faculty-modal-header">

                <div>
                  <span>
                    {
                      editingTeacher
                        ? "EDIT ARCHIVE ENTRY"
                        : "NEW ARCHIVE ENTRY"
                    }
                  </span>

                  <h2>
                    {
                      editingTeacher
                        ? "Refine Professor"
                        : "Add Professor"
                    }
                  </h2>
                </div>


                <button
                  className="faculty-modal-close"
                  onClick={
                    closeModal
                  }
                >
                  <X size={18} />
                </button>

              </div>


              <form
                className="faculty-form"
                onSubmit={
                  handleSubmit
                }
              >

                <div className="faculty-photo-editor">

                  <div className="faculty-photo-preview">

                    {photoPreview ? (
                      <img
                        src={
                          photoPreview
                        }
                        alt="Professor preview"
                      />
                    ) : (
                      <UserRound
                        size={34}
                      />
                    )}

                  </div>


                  <label className="photo-upload-button">

                    <Camera
                      size={16}
                    />

                    {
                      photoPreview
                        ? "Change Photo"
                        : "Upload Photo"
                    }

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handlePhotoChange
                      }
                    />

                  </label>


                  <p>
                    JPG, PNG or WEBP.
                    Maximum 5 MB.
                  </p>

                </div>


                <div className="faculty-form-grid">

                  <label className="faculty-field">

                    <span>
                      Professor Name
                    </span>

                    <input
                      value={
                        form.name
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,

                            name:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      placeholder="e.g. Dr. Ananya Sharma"
                      required
                    />

                  </label>


                  <label className="faculty-field">

                    <span>
                      Department
                    </span>

                    <input
                      value={
                        form.department
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,

                            department:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      placeholder="Computer Science"
                      required
                    />

                  </label>

                </div>


                <label className="faculty-field">

                  <span>
                    Short Description
                  </span>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          description:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="A short description for the ProfessorDex profile..."
                    rows={4}
                  />

                </label>


                <div className="faculty-semester-field">

                  <span className="faculty-field-title">
                    Assigned Semesters
                  </span>

                  <p>
                    A professor can
                    appear in multiple
                    semester portals.
                  </p>


                  <div className="semester-selector">

                    {semesters.map(
                      (
                        semester
                      ) => {

                        const selected =
                          form.semesterIds.includes(
                            semester.id
                          );

                        return (
                          <button
                            type="button"

                            key={
                              semester.id
                            }

                            className={
                              selected
                                ? "semester-choice selected"
                                : "semester-choice"
                            }

                            onClick={() =>
                              toggleSemester(
                                semester.id
                              )
                            }
                          >

                            <span className="semester-choice-orb">
                              {
                                selected
                                  ? "✓"
                                  : semester.id
                              }
                            </span>

                            <div>
                              <strong>
                                {
                                  semester.name
                                }
                              </strong>

                              <small>
                                {
                                  semester.slug
                                }
                              </small>
                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>


                {error && (
                  <motion.div
                    className="faculty-form-error"
                    initial={{
                      opacity: 0,
                      y: -3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    {error}
                  </motion.div>
                )}


                <div className="faculty-form-actions">

                  <button
                    type="button"
                    className="archive-secondary-button"
                    onClick={
                      closeModal
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="archive-primary-button"
                    disabled={
                      submitting
                    }
                  >
                    {submitting ? (
                      "Saving..."
                    ) : editingTeacher ? (
                      <>
                        <Sparkles
                          size={16}
                        />

                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus
                          size={16}
                        />

                        Add Professor
                      </>
                    )}
                  </button>

                </div>

              </form>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}