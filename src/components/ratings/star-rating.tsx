"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="text-3xl cursor-pointer transition-transform hover:scale-110 focus:outline-none"
            aria-label={`${star} ${star === 1 ? "stella" : "stelle"}`}
          >
            <span className={isFilled ? "text-yellow-500" : "text-gray-300"}>
              {isFilled ? "★" : "☆"}
            </span>
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground self-center">
          {value}/5
        </span>
      )}
    </div>
  );
}
