import {
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";


export default function ProfessorRatingPlaceholder() {
  const {
    semesterSlug,
  } = useParams();

  const navigate =
    useNavigate();


  return (
    <div className="rating-placeholder-page">

      <button
        className="student-auth-back"
        onClick={() =>
          navigate(
            `/rate/${semesterSlug}/dex`
          )
        }
      >
        <ArrowLeft
          size={16}
        />

        Back to Faculty
      </button>


      <div className="rating-placeholder-card">

        <Sparkles
          size={32}
        />

        <span>
          NEXT MODULE
        </span>

        <h1>
          Professor Rating
        </h1>

        <p>
          The five-category rating
          experience will live here.
        </p>

      </div>

    </div>
  );
}