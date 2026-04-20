export function RocketIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rocket body */}
      <path
        d="M32 6C32 6 22 18 22 36C22 42 24 47 28 50H36C40 47 42 42 42 36C42 18 32 6 32 6Z"
        fill="#B8CCE8"
        stroke="#2D5BBA"
        strokeWidth="1.5"
      />
      {/* Window */}
      <circle cx="32" cy="28" r="5" fill="#FFFFFF" stroke="#2D5BBA" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="2.5" fill="#F4C542" />
      {/* Fins */}
      <path d="M22 38C22 38 16 42 15 48L22 46Z" fill="#B8CCE8" stroke="#2D5BBA" strokeWidth="1" />
      <path d="M42 38C42 38 48 42 49 48L42 46Z" fill="#B8CCE8" stroke="#2D5BBA" strokeWidth="1" />
      {/* Flame */}
      <path d="M28 50C28 50 30 58 32 58C34 58 36 50 36 50" fill="#F07040" />
      <path d="M30 50C30 50 31 55 32 55C33 55 34 50 34 50" fill="#F4C542" />
    </svg>
  );
}

export function PeerSpaceLogo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: { icon: 28, box: 36, text: "text-base" },
    md: { icon: 32, box: 44, text: "text-lg" },
    lg: { icon: 40, box: 52, text: "text-2xl" },
  };
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: s.box,
          height: s.box,
          background: "linear-gradient(135deg, var(--ps-accent), var(--ps-accent-dark))",
          boxShadow: "0 4px 20px var(--ps-accent-glow)",
        }}
      >
        <RocketIcon size={s.icon} />
      </div>
      <span
        className={`${s.text} font-extrabold tracking-tight text-foreground`}
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        PeerSpace
      </span>
    </div>
  );
}
