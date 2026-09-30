import React from "react";

const createIcon = (svgContent, defaultStroke = true) => {
  return ({ size = 18, color = "currentColor", className = "", style = {}, strokeWidth = 2, ...props }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={defaultStroke ? "none" : color}
      stroke={defaultStroke ? color : "none"}
      strokeWidth={defaultStroke ? strokeWidth : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`svg-icon ${className}`.trim()}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      {...props}
    >
      {svgContent}
    </svg>
  );
};

export const ZapIcon = createIcon(
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
);

export const TargetIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </>
);

export const DumbbellIcon = createIcon(
  <>
    <path d="m6.5 6.5 11 11" />
    <path d="m21 21-1-1a2 2 0 0 0-2.8 0l-1.4 1.4a2 2 0 0 1-2.8 0l-.7-.7a2 2 0 0 1 0-2.8l1.4-1.4a2 2 0 0 0 0-2.8l-1-1" />
    <path d="m3 3 1 1a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8l-1.4 1.4a2 2 0 0 0 0 2.8l1 1" />
  </>
);

export const DnaIcon = createIcon(
  <>
    <path d="M2 15c6.667-6 13.333 0 20-6" />
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
    <path d="m17 6-2.5-2.5" />
    <path d="m14 8-1-1" />
    <path d="m7 18 2.5 2.5" />
    <path d="m3.5 14.5.5.5" />
    <path d="m20 9 .5.5" />
    <path d="m6.5 12.5 1 1" />
    <path d="m16.5 10.5 1 1" />
    <path d="M10 16 7.5 13.5" />
    <path d="m14 10.5 2.5-2.5" />
  </>
);

export const LockIcon = createIcon(
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
);

export const UnlockIcon = createIcon(
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </>
);

export const CheckIcon = createIcon(
  <polyline points="20 6 9 17 4 12" />
);

export const CheckCircleIcon = createIcon(
  <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </>
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

export const FlameIcon = createIcon(
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
);

export const CalendarIcon = createIcon(
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>
);

export const PrintIcon = createIcon(
  <>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </>
);

export const RefreshCwIcon = createIcon(
  <>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </>
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </>
);

export const CompassIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </>
);

export const ScaleIcon = createIcon(
  <>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </>
);

export const UtensilsIcon = createIcon(
  <>
    <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
    <path d="M15 2v10" />
    <path d="M12 2v10" />
    <path d="M18 12v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8" />
    <path d="M6 2v20" />
    <path d="M9 2v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
  </>
);

export const AppleIcon = createIcon(
  <>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M10 2c1 .5 2 2 2 5" />
  </>
);

export const CoffeeIcon = createIcon(
  <>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" x2="6" y1="2" y2="4" />
    <line x1="10" x2="10" y1="2" y2="4" />
    <line x1="14" x2="14" y1="2" y2="4" />
  </>
);

export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>
);

export const MoonIcon = createIcon(
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
);

export const TrendingDownIcon = createIcon(
  <>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </>
);

export const TrendingUpIcon = createIcon(
  <>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </>
);

export const AwardIcon = createIcon(
  <>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </>
);

export const ActivityIcon = createIcon(
  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
);

export const PlayIcon = createIcon(
  <polygon points="5 3 19 12 5 21 5 3" />
);

export const PauseIcon = createIcon(
  <>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </>
);

export const PlusIcon = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

export const MinusIcon = createIcon(
  <line x1="5" y1="12" x2="19" y2="12" />
);

export const TrashIcon = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>
);

export const CopyIcon = createIcon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>
);

export const SaveIcon = createIcon(
  <>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </>
);

export const ChevronLeftIcon = createIcon(
  <polyline points="15 18 9 12 15 6" />
);

export const ChevronRightIcon = createIcon(
  <polyline points="9 18 15 12 9 6" />
);

export const ChevronDownIcon = createIcon(
  <polyline points="6 9 12 15 18 9" />
);

export const ChevronUpIcon = createIcon(
  <polyline points="18 15 12 9 6 15" />
);

export const UserIcon = createIcon(
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

export const LogoutIcon = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);

export const VideoIcon = createIcon(
  <>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </>
);

export const XIcon = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

export const BarChartIcon = createIcon(
  <>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </>
);

export const ShieldCheckIcon = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const SparklesIcon = createIcon(
  <>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </>
);

export const InfoIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const RepeatIcon = createIcon(
  <>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </>
);

export const MapPinIcon = createIcon(
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

export const MailIcon = createIcon(
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>
);

export const PhoneIcon = createIcon(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
);

export const FacebookIcon = createIcon(
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
);

export const TwitterIcon = createIcon(
  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
);

export const LinkedinIcon = createIcon(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>
);

export const InstagramIcon = createIcon(
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>
);

export const HomeIcon = createIcon(
  <>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>
);

export const LayoutDashboardIcon = createIcon(
  <>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </>
);

export const LogInIcon = createIcon(
  <>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </>
);

export const CalculatorIcon = createIcon(
  <>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </>
);

export const LayersIcon = createIcon(
  <>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </>
);

export const BellIcon = createIcon(
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>
);

