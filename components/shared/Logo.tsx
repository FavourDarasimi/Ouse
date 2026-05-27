"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

const pinSizes = {
  sm: 20,
  md: 26,
  lg: 32,
};

const fontSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({
  href = "/",
  className = "",
  size = "md",
  variant = "dark",
}: LogoProps) {
  const s = pinSizes[size];
  const isLight = variant === "light";

  const content = (
    <span
      className={`inline-flex items-center font-bold ${fontSizes[size]} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width={s}
        height={s}
        className="shrink-0"
        style={{ marginTop: "-0.08em" }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={isLight ? "#FFFFFF" : "#047857"}
          strokeWidth="2.5"
        />
        <path
          d="M8 12L12 8L16 12V16H8Z"
          fill={isLight ? "#FFFFFF" : "#047857"}
        />
        <rect x="11.5" y="14" width="1" height="2" fill={isLight ? "#18181B" : "white"} />
      </svg>
      <span
        className={`tracking-tight ${isLight ? "text-white" : "text-primary"}`}
      >
        USE
      </span>
    </span>
  );

  return <Link href={href}>{content}</Link>;
}
