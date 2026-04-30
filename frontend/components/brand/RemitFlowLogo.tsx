import { cn } from "@/lib/utils";

interface RemitFlowLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function RemitFlowLogo({
  className,
  markClassName,
  textClassName,
  showText = true,
}: RemitFlowLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", markClassName)}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="10" fill="url(#remitflow-gradient)" />
        <path
          d="M8 22L16 10L24 22"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 18H20"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="remitflow-gradient"
            x1="3"
            y1="2"
            x2="29"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>
      {showText ? (
        <span
          className={cn(
            "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-xl font-black text-transparent tracking-tight",
            textClassName,
          )}
        >
          RemitFlow
        </span>
      ) : null}
    </div>
  );
}
