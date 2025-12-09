"use client";
import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

export default function ChapterProgress({ chapters = 5 }) {
  const [completed, setCompleted] = useState([]);
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Chapters</h3>
      <div className="flex flex-col gap-2">
        {Array.from({ length: chapters }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <button
              className="text-purple-600"
              onClick={() =>
                setCompleted((prev) =>
                  prev.includes(idx)
                    ? prev.filter((i) => i !== idx)
                    : [...prev, idx]
                )
              }
              aria-label={
                completed.includes(idx)
                  ? "Unmark as complete"
                  : "Mark as complete"
              }
            >
              {completed.includes(idx) ? (
                <CheckCircle size={20} />
              ) : (
                <Circle size={20} />
              )}
            </button>
            <span
              className={
                completed.includes(idx) ? "line-through text-gray-400" : ""
              }
            >
              Chapter {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
