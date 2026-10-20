import {
  Sparkles,
} from "lucide-react";

export default function ComingSoon({
  title,
}) {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-card">
        <Sparkles
          size={28}
        />

        <span>
          NEXT MODULE
        </span>

        <h1>
          {title}
        </h1>

        <p>
          This section is being
          forged next.
        </p>
      </div>
    </div>
  );
}