import { SpriteAvatar } from "./SpriteAvatar";

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { className: "h-8 w-8 text-xs", pixels: 32 },
  md: { className: "h-10 w-10 text-sm", pixels: 40 },
  lg: { className: "h-14 w-14 text-base", pixels: 56 },
};

const colorPalette = ["#1db954", "#0a84ff", "#ffb547", "#37d27c", "#ff6158", "#5ac8fa", "#64d2ff", "#30d158"];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export function Avatar({ src, username, size = "md", className = "" }: AvatarProps) {
  const sizeConfig = sizeMap[size];

  if (src) {
    if (src.includes("/sprites/")) {
      return (
        <SpriteAvatar
          src={src}
          alt={username}
          size={sizeConfig.pixels}
          className={`${sizeConfig.className} rounded-full ring-1 ring-[var(--border-light)] ${className}`}
        />
      );
    }

    return (
      <img
        src={src}
        alt={username}
        className={`${sizeConfig.className} rounded-full object-cover ring-1 ring-[var(--border-light)] ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeConfig.className} rounded-full flex items-center justify-center font-bold text-[#04110a] ring-1 ring-white/20 ${className}`}
      style={{ backgroundColor: getColor(username) }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
