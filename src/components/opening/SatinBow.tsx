"use client";

/** Classic gift bow — knot at (120, 114), symmetric ribbon loops + tails */
export function SatinBow() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="bow-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEFB" />
          <stop offset="40%" stopColor="#F8F3EC" />
          <stop offset="100%" stopColor="#DDD7CF" />
        </linearGradient>
        <linearGradient id="bow-fold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8E3DB" />
          <stop offset="100%" stopColor="#C9C3BB" />
        </linearGradient>
        <linearGradient id="bow-tail" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#F5F0E9" />
          <stop offset="100%" stopColor="#D5CFC7" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 6)">
        {/* Tails */}
        <path
          d="M 106 118
             L 96 208
             L 104 204
             L 112 158
             L 116 204
             L 124 208
             L 114 118
             Z"
          fill="url(#bow-tail)"
        />
        <path
          d="M 134 118
             L 144 208
             L 136 204
             L 128 158
             L 124 204
             L 116 208
             L 126 118
             Z"
          fill="url(#bow-tail)"
        />

        {/* Back loops */}
        <path
          d="M 120 112
             C 120 44, 34 40, 44 78
             C 54 106, 90 104, 120 112
             Z"
          fill="url(#bow-fold)"
        />
        <path
          d="M 120 112
             C 120 44, 206 40, 196 78
             C 186 106, 150 104, 120 112
             Z"
          fill="url(#bow-fold)"
        />

        {/* Front loops */}
        <path
          d="M 120 114
             C 120 58, 62 54, 66 80
             C 72 100, 94 102, 120 114
             Z"
          fill="url(#bow-face)"
        />
        <path
          d="M 120 114
             C 120 58, 178 54, 174 80
             C 168 100, 146 102, 120 114
             Z"
          fill="url(#bow-face)"
        />

        {/* Fold lines */}
        <path
          d="M 120 114 C 94 110, 72 98, 66 80"
          fill="none"
          stroke="#B5AFA7"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
        <path
          d="M 120 114 C 146 110, 168 98, 174 80"
          fill="none"
          stroke="#B5AFA7"
          strokeWidth="1"
          strokeOpacity="0.45"
        />

        {/* Knot */}
        <ellipse cx="120" cy="112" rx="22" ry="16" fill="url(#bow-fold)" />
        <ellipse cx="120" cy="110" rx="20" ry="14" fill="url(#bow-face)" />
        <ellipse cx="120" cy="108" rx="10" ry="6" fill="#FFFFFF" fillOpacity="0.5" />

        {/* Loop highlights */}
        <ellipse cx="58" cy="68" rx="16" ry="9" fill="#FFFFFF" fillOpacity="0.55" />
        <ellipse cx="182" cy="68" rx="16" ry="9" fill="#FFFFFF" fillOpacity="0.5" />
      </g>
    </svg>
  );
}
