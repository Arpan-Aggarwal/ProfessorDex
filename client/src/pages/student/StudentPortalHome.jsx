import {
  motion,
} from "framer-motion";

import {
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import {
  useStudentAuth,
} from "../../context/StudentAuthContext";


export default function StudentPortalHome() {
  const {
    student,
  } = useStudentAuth();


  return (
    <div className="student-portal-home">

      <motion.div
        className="student-portal-hero"

        initial={{
          opacity: 0,
          y: 15,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <div className="student-portal-icon">

          <GraduationCap
            size={35}
          />

        </div>


        <div className="student-portal-eyebrow">

          <Sparkles
            size={14}
          />

          ACCESS CONFIRMED

        </div>


        <h1>
          Welcome to
          {" "}
          {
            student?.semester
              ?.name
          }
          .
        </h1>


        <p>
          Your ProfessorDex student
          portal is active and ready.
        </p>


        <div className="student-auth-success">

          <CheckCircle2
            size={19}
          />

          Authentication system
          working correctly

        </div>


        <div className="student-next-preview">

          <span>
            NEXT MODULE
          </span>

          <h2>
            Faculty Collection
          </h2>

          <p>
            This area becomes the
            professor gallery in our
            next step.
          </p>

        </div>

      </motion.div>

    </div>
  );
}