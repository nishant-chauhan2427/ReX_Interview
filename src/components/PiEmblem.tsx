interface PiEmblemProps {
  size?: number;
  id?: string;
}

const PiEmblem = ({ size = 34, id = "rg1" }: PiEmblemProps) => (
  <svg width={size} height={size} viewBox="0 0 750 766" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient
        id={id}
        gradientTransform="translate(431 404) rotate(90) scale(268 295)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#07EAD3" />
        <stop offset="1" stopColor="#004D9C" />
      </radialGradient>
      <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="38" />
      </filter>
    </defs>

    <ellipse
      cx="431"
      cy="404"
      rx="268"
      ry="295"
      fill={`url(#${id})`}
      filter={`url(#glow-${id})`}
      opacity="0.55"
    />

    <circle cx="431" cy="404" r="213" fill="#1E1E1E" />

    <text
      x="431"
      y="470"
      textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontSize="195"
      fontWeight="700"
      fill={`url(#${id})`}
    >
      π
    </text>
  </svg>
);

export default PiEmblem;
