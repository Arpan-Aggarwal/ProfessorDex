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
  Check,
  Copy,
  Download,
  KeyRound,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import api from "../../api/http";


export default function PrivateCodes() {
  const [
    semesters,
    setSemesters,
  ] = useState([]);

  const [
    codes,
    setCodes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedSemester,
    setSelectedSemester,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState(10);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    generatedCodes,
    setGeneratedCodes,
  ] = useState([]);

  const [
    generatedSemester,
    setGeneratedSemester,
  ] = useState(null);

  const [
    revealOpen,
    setRevealOpen,
  ] = useState(false);

  const [
    copiedCode,
    setCopiedCode,
  ] = useState("");

  const [
    copiedAll,
    setCopiedAll,
  ] = useState(false);

  const [
    semesterFilter,
    setSemesterFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        semesterResponse,
        codeResponse,
      ] = await Promise.all([
        api.get(
          "/admin/ratings/semesters"
        ),

        api.get(
          "/admin/codes"
        ),
      ]);

      const semesterData =
        semesterResponse.data
          .semesters ?? [];

      const codeData =
        codeResponse.data
          .codes ?? [];

      setSemesters(
        semesterData
      );

      setCodes(
        codeData
      );

      if (
        semesterData.length > 0 &&
        !selectedSemester
      ) {
        setSelectedSemester(
          String(
            semesterData[0].id
          )
        );
      }

    } catch (err) {
      console.error(
        "Private code load error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
        "Unable to load private codes."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  const filteredCodes =
    useMemo(() => {
      return codes.filter(
        (code) => {
          const semesterMatch =
            semesterFilter === "all" ||
            String(
              code.semesterId
            ) ===
              semesterFilter;

          const statusMatch =
            statusFilter === "all" ||
            (
              statusFilter === "used"
                ? code.isUsed
                : !code.isUsed
            );

          return (
            semesterMatch &&
            statusMatch
          );
        }
      );
    }, [
      codes,
      semesterFilter,
      statusFilter,
    ]);


  const unusedCount =
    codes.filter(
      (code) =>
        !code.isUsed
    ).length;


  const usedCount =
    codes.filter(
      (code) =>
        code.isUsed
    ).length;


  async function generateCodes() {
    setError("");

    const semesterId =
      Number(
        selectedSemester
      );

    const count =
      Number(quantity);


    if (
      !Number.isInteger(
        semesterId
      )
    ) {
      setError(
        "Please choose a semester."
      );

      return;
    }


    if (
      !Number.isInteger(
        count
      ) ||
      count < 1 ||
      count > 500
    ) {
      setError(
        "Quantity must be between 1 and 500."
      );

      return;
    }


    try {
      setGenerating(true);

      const response =
        await api.post(
          "/admin/codes/generate",
          {
            semesterId,
            count,
          }
        );

      const newCodes =
        response.data.codes ?? [];

      setGeneratedCodes(
        newCodes
      );

      setGeneratedSemester(
        response.data.semester ??
        null
      );

      setRevealOpen(true);

      await loadData();

    } catch (err) {
      console.error(
        "Code generation error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
        "Unable to generate private codes."
      );

    } finally {
      setGenerating(false);
    }
  }


  async function copyText(
    text
  ) {
    await navigator.clipboard.writeText(
      text
    );
  }


  async function copyOne(
    code
  ) {
    try {
      await copyText(code);

      setCopiedCode(
        code
      );

      setTimeout(() => {
        setCopiedCode("");
      }, 1400);

    } catch {
      window.alert(
        "Unable to copy code."
      );
    }
  }


  async function copyAllCodes() {
    try {
      await copyText(
        generatedCodes.join(
          "\n"
        )
      );

      setCopiedAll(true);

      setTimeout(() => {
        setCopiedAll(false);
      }, 1600);

    } catch {
      window.alert(
        "Unable to copy codes."
      );
    }
  }


  function exportCodes() {
    if (
      generatedCodes.length ===
      0
    ) {
      return;
    }

    const semesterName =
      generatedSemester?.name ??
      "semester";

    const content = [
      "ProfessorDex Private Codes",
      `Semester: ${semesterName}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      ...generatedCodes,
      "",
      "These codes are one-time use only.",
    ].join("\n");

    const blob =
      new Blob(
        [content],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      url;

    anchor.download =
      `ProfessorDex-${semesterName.replace(
        /\s+/g,
        "-"
      )}-codes.txt`;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url
    );
  }


  async function deleteCode(
    code
  ) {
    if (code.isUsed) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this unused private code?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/codes/${code.id}`
      );

      await loadData();

    } catch (err) {
      window.alert(
        err?.response?.data
          ?.message ||
        "Unable to delete code."
      );
    }
  }


  function closeReveal() {
    setRevealOpen(false);

    /*
      Important:
      plaintext codes disappear
      after this modal closes.

      Only hashes remain in DB.
    */

    setTimeout(() => {
      setGeneratedCodes(
        []
      );

      setGeneratedSemester(
        null
      );

      setCopiedAll(false);
      setCopiedCode("");
    }, 250);
  }


  return (
    <div className="private-code-page">

      <header className="page-header">
        <div>
          <div className="eyebrow">
            <KeyRound
              size={14}
            />

            ACCESS SIGILS
          </div>

          <h1>
            Private Codes
          </h1>

          <p>
            Generate one-time
            semester access keys for
            student registration.
          </p>
        </div>

        <div className="code-security-pill">
          <ShieldCheck
            size={15}
          />

          Hash protected
        </div>
      </header>


      <section className="code-overview-grid">

        <article className="code-overview-card">
          <span>
            TOTAL ISSUED
          </span>

          <strong>
            {codes.length}
          </strong>

          <p>
            Private access codes
            generated.
          </p>
        </article>


        <article className="code-overview-card">
          <span>
            UNUSED
          </span>

          <strong>
            {unusedCount}
          </strong>

          <p>
            Keys still available for
            registration.
          </p>
        </article>


        <article className="code-overview-card">
          <span>
            CLAIMED
          </span>

          <strong>
            {usedCount}
          </strong>

          <p>
            Codes already consumed by
            student accounts.
          </p>
        </article>

      </section>


      <section className="code-forge-panel">

        <div className="code-forge-copy">
          <div className="code-forge-icon">
            <Sparkles
              size={21}
            />
          </div>

          <div>
            <span>
              CODE FORGE
            </span>

            <h2>
              Generate Access Keys
            </h2>

            <p>
              Plaintext codes are
              revealed only once.
              ProfessorDex stores
              only their secure
              hashes.
            </p>
          </div>
        </div>


        <div className="code-generator-controls">

          <label>
            <span>
              Semester
            </span>

            <select
              value={
                selectedSemester
              }
              onChange={(
                event
              ) =>
                setSelectedSemester(
                  event.target.value
                )
              }
            >
              {semesters.map(
                (semester) => (
                  <option
                    key={
                      semester.id
                    }
                    value={
                      semester.id
                    }
                  >
                    {semester.name}
                  </option>
                )
              )}
            </select>
          </label>


          <label>
            <span>
              Quantity
            </span>

            <input
              type="number"
              min="1"
              max="500"
              value={
                quantity
              }
              onChange={(
                event
              ) =>
                setQuantity(
                  event.target.value
                )
              }
            />
          </label>


          <button
            className="archive-primary-button code-generate-button"
            onClick={
              generateCodes
            }
            disabled={
              generating
            }
          >
            <Plus
              size={16}
            />

            {generating
              ? "Forging..."
              : "Generate Codes"}
          </button>

        </div>

      </section>


      {error && (
        <div className="archive-error">
          {error}
        </div>
      )}


      <section className="code-vault">

        <div className="code-vault-header">

          <div>
            <span>
              ACCESS VAULT
            </span>

            <h2>
              Generated Records
            </h2>
          </div>


          <div className="code-filters">

            <select
              value={
                semesterFilter
              }
              onChange={(
                event
              ) =>
                setSemesterFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Semesters
              </option>

              {semesters.map(
                (semester) => (
                  <option
                    key={
                      semester.id
                    }
                    value={
                      semester.id
                    }
                  >
                    {semester.name}
                  </option>
                )
              )}
            </select>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Statuses
              </option>

              <option value="unused">
                Unused
              </option>

              <option value="used">
                Used
              </option>
            </select>

          </div>

        </div>


        {loading ? (
          <div className="code-vault-empty">
            <div className="archive-loading-sigil">
              PD
            </div>

            <p>
              Reading the access
              vault...
            </p>
          </div>
        ) : filteredCodes.length ===
          0 ? (
          <div className="code-vault-empty">
            <KeyRound
              size={29}
            />

            <h3>
              No code records
            </h3>

            <p>
              Generate some private
              codes to populate the
              vault.
            </p>
          </div>
        ) : (
          <div className="code-table">

            <div className="code-table-head">
              <span>
                SEMESTER
              </span>

              <span>
                STATUS
              </span>

              <span>
                CREATED
              </span>

              <span>
                USED AT
              </span>

              <span>
                ACTION
              </span>
            </div>


            {filteredCodes.map(
              (code) => (
                <motion.div
                  className="code-table-row"
                  key={
                    code.id
                  }
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >

                  <div className="code-semester-cell">
                    <div className="mini-key-sigil">
                      <KeyRound
                        size={14}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          code.semester
                            ?.name
                        }
                      </strong>

                      <span>
                        {
                          code.semester
                            ?.slug
                        }
                      </span>
                    </div>
                  </div>


                  <div>
                    <span
                      className={
                        code.isUsed
                          ? "code-status used"
                          : "code-status unused"
                      }
                    >
                      <span />

                      {code.isUsed
                        ? "Claimed"
                        : "Available"}
                    </span>
                  </div>


                  <div className="code-date">
                    {new Date(
                      code.createdAt
                    ).toLocaleString()}
                  </div>


                  <div className="code-date">
                    {code.usedAt
                      ? new Date(
                          code.usedAt
                        ).toLocaleString()
                      : "—"}
                  </div>


                  <div>
                    {!code.isUsed ? (
                      <button
                        className="code-delete-button"
                        onClick={() =>
                          deleteCode(
                            code
                          )
                        }
                        title="Delete unused code"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    ) : (
                      <span className="code-locked">
                        Locked
                      </span>
                    )}
                  </div>

                </motion.div>
              )
            )}

          </div>
        )}

      </section>


      <AnimatePresence>
        {revealOpen && (
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
          >

            <motion.div
              className="code-reveal-modal"

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
              }}
            >

              <div className="code-reveal-header">

                <div>
                  <span>
                    ONE-TIME REVEAL
                  </span>

                  <h2>
                    Access Keys Forged
                  </h2>

                  <p>
                    Save these codes
                    now. They cannot be
                    recovered after
                    this window closes.
                  </p>
                </div>


                <button
                  onClick={
                    closeReveal
                  }
                >
                  <X size={18} />
                </button>

              </div>


              <div className="code-warning-banner">
                <ShieldCheck
                  size={18}
                />

                <div>
                  <strong>
                    {
                      generatedSemester
                        ?.name
                    }
                  </strong>

                  <span>
                    {
                      generatedCodes.length
                    }
                    {" "}
                    one-time registration
                    codes
                  </span>
                </div>
              </div>


              <div className="generated-code-list">

                {generatedCodes.map(
                  (
                    code,
                    index
                  ) => (
                    <div
                      className="generated-code-item"
                      key={
                        code
                      }
                    >

                      <span className="generated-code-index">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>


                      <code>
                        {code}
                      </code>


                      <button
                        onClick={() =>
                          copyOne(
                            code
                          )
                        }
                      >
                        {copiedCode ===
                        code ? (
                          <Check
                            size={16}
                          />
                        ) : (
                          <Copy
                            size={16}
                          />
                        )}
                      </button>

                    </div>
                  )
                )}

              </div>


              <div className="code-reveal-actions">

                <button
                  className="archive-secondary-button"
                  onClick={
                    exportCodes
                  }
                >
                  <Download
                    size={16}
                  />

                  Export TXT
                </button>


                <button
                  className="archive-secondary-button"
                  onClick={
                    copyAllCodes
                  }
                >
                  {copiedAll ? (
                    <Check
                      size={16}
                    />
                  ) : (
                    <Copy
                      size={16}
                    />
                  )}

                  {copiedAll
                    ? "Copied"
                    : "Copy All"}
                </button>


                <button
                  className="archive-primary-button"
                  onClick={
                    closeReveal
                  }
                >
                  I've Saved Them
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}