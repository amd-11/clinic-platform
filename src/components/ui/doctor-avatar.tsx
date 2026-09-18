import { cn } from "@/lib/utils";

type DoctorAvatarProps = {
  /** Brand hue of the doctor, from the database */
  hue: number;
  /** 0–3: picks the illustration variant (hair and accessories) */
  variant: number;
  className?: string;
};

/**
 * Flat vector portrait used instead of a photo.
 *
 * The clinic is fictional, so using a stock photo of a real person as a named
 * doctor would be misleading. These illustrations are deliberately abstract —
 * a neutral head tone, no facial features — and are meant to be replaced with
 * the client's real photos when the template is sold.
 */
export function DoctorAvatar({ hue, variant, className }: DoctorAvatarProps) {
  const id = `doc-${hue}-${variant}`;
  const hair = `hsl(${hue} 32% 28%)`;
  const head = `hsl(${hue} 14% 84%)`;
  // Variants follow the seeded doctors: 0 long hair, 1 short + glasses,
  // 2 long hair + glasses, 3 short + beard
  const longHair = variant === 0 || variant === 2;
  const bun = false;
  const glasses = variant === 1 || variant === 2;
  const beard = variant === 3;

  return (
    <svg
      viewBox="0 0 200 210"
      className={cn("size-full", className)}
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 46% 88%)`} />
          <stop offset="100%" stopColor={`hsl(${hue} 38% 70%)`} />
        </linearGradient>
        <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef4f3" />
        </linearGradient>
      </defs>

      <rect width="200" height="210" fill={`url(#${id}-bg)`} />
      <circle cx="100" cy="94" r="64" fill="#ffffff" opacity="0.25" />

      {/* Hair volume behind the head */}
      {longHair && (
        <path d="M58 96c0-30 19-50 42-50s42 20 42 50c0 18-3 30-6 40H64c-3-10-6-22-6-40Z" fill={hair} />
      )}
      {bun && <circle cx="100" cy="38" r="15" fill={hair} />}

      {/* Neck */}
      <path d="M88 112h24v22H88z" fill={head} />
      <path d="M88 112h24v10a34 34 0 0 1-24 0Z" fill={`hsl(${hue} 14% 74%)`} />

      {/* Head */}
      <ellipse cx="100" cy="86" rx="34" ry="37" fill={head} />
      {/* Ears */}
      <circle cx="66" cy="88" r="6" fill={head} />
      <circle cx="134" cy="88" r="6" fill={head} />

      {/* Hair on top — leaves the face open */}
      <path
        d={
          longHair
            ? "M66 78c2-22 16-36 34-36s32 14 34 36c-6-14-18-21-34-21s-28 7-34 21Z"
            : "M67 80c1-23 15-38 33-38s32 15 33 38c-7-13-18-19-33-19s-26 6-33 19Z"
        }
        fill={hair}
      />
      {longHair && (
        <>
          <path d="M66 78c-4 14-5 28-4 42 5-6 7-18 8-30Z" fill={hair} />
          <path d="M134 78c4 14 5 28 4 42-5-6-7-18-8-30Z" fill={hair} />
        </>
      )}

      {beard && (
        <path
          d="M70 92c0 26 13 40 30 40s30-14 30-40c-4 18-15 26-30 26s-26-8-30-26Z"
          fill={hair}
          opacity="0.9"
        />
      )}

      {glasses && (
        <g stroke={hair} strokeWidth="3" fill="none">
          <circle cx="86" cy="88" r="12" />
          <circle cx="114" cy="88" r="12" />
          <path d="M98 88h4M74 86l-8-2M126 86l8-2" />
        </g>
      )}

      {/* Shoulders in a medical coat */}
      <path
        d="M100 130c-30 0-54 17-60 42-2 9-3 22-3 38h126c0-16-1-29-3-38-6-25-30-42-60-42Z"
        fill={`url(#${id}-coat)`}
      />
      {/* Collar */}
      <path d="M100 130 79 176l21 11 21-11-21-46Z" fill={`hsl(${hue} 26% 94%)`} />
      <path d="M100 130 79 176M100 130l21 46" stroke={`hsl(${hue} 22% 76%)`} strokeWidth="2.5" fill="none" />

      {/* Stethoscope */}
      <path
        d="M84 136c-9 16-5 34 13 38s28-12 24-30"
        stroke="hsl(178 55% 32%)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="124" cy="146" r="6" fill="hsl(40 55% 58%)" />
    </svg>
  );
}
