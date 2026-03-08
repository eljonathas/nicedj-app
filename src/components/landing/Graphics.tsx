import { motion } from 'framer-motion'

export function SignalConstellationSvg({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 900 280"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="signal-line-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(124,184,255,0)" />
          <stop offset="50%" stopColor="rgba(124,184,255,0.95)" />
          <stop offset="100%" stopColor="rgba(24,226,153,0)" />
        </linearGradient>
        <linearGradient id="signal-line-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(24,226,153,0)" />
          <stop offset="50%" stopColor="rgba(24,226,153,0.92)" />
          <stop offset="100%" stopColor="rgba(124,184,255,0)" />
        </linearGradient>
      </defs>

      {[
        {
          d: 'M20 190C120 118 180 102 255 114C338 128 395 196 480 196C596 196 641 84 756 84C814 84 858 116 880 136',
          stroke: 'url(#signal-line-a)',
          duration: 8,
        },
        {
          d: 'M30 140C110 150 168 176 240 176C340 176 386 104 480 104C588 104 626 200 722 200C792 200 842 166 876 148',
          stroke: 'url(#signal-line-b)',
          duration: 7,
        },
      ].map((path) => (
        <motion.path
          key={path.d}
          d={path.d}
          stroke={path.stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0.15, opacity: 0.2 }}
          animate={{
            pathLength: [0.15, 1, 0.25],
            opacity: [0.2, 0.85, 0.22],
          }}
          transition={{
            duration: path.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      ))}

      {[
        { cx: 140, cy: 146, delay: 0.2 },
        { cx: 256, cy: 116, delay: 0.4 },
        { cx: 480, cy: 104, delay: 0.6 },
        { cx: 640, cy: 112, delay: 0.8 },
        { cx: 780, cy: 96, delay: 1 },
      ].map((dot) => (
        <motion.circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r="3"
          fill="rgba(255,255,255,0.9)"
          animate={{
            opacity: [0.35, 1, 0.35],
            scale: [1, 1.45, 1],
          }}
          transition={{
            duration: 3.2,
            delay: dot.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  )
}

export function OpsWaveSvg() {
  return (
    <svg
      viewBox="0 0 720 240"
      className="h-auto w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ops-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(124,184,255,0)" />
          <stop offset="35%" stopColor="rgba(124,184,255,0.95)" />
          <stop offset="72%" stopColor="rgba(24,226,153,0.95)" />
          <stop offset="100%" stopColor="rgba(24,226,153,0)" />
        </linearGradient>
      </defs>

      <g opacity="0.2">
        {Array.from({ length: 6 }).map((_, index) => (
          <line
            key={index}
            x1="0"
            y1={32 + index * 32}
            x2="720"
            y2={32 + index * 32}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="3 8"
          />
        ))}
      </g>

      <motion.path
        d="M0 152C58 152 72 66 132 66C190 66 200 186 264 186C326 186 338 84 402 84C468 84 476 176 544 176C608 176 618 100 680 100C700 100 710 112 720 122"
        stroke="url(#ops-wave)"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{
          pathLength: [0.2, 1, 0.32],
          opacity: [0.3, 1, 0.32],
        }}
        transition={{
          duration: 6.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      {[
        { cx: 132, cy: 66, delay: 0.2 },
        { cx: 264, cy: 186, delay: 0.5 },
        { cx: 402, cy: 84, delay: 0.8 },
        { cx: 544, cy: 176, delay: 1.1 },
        { cx: 680, cy: 100, delay: 1.4 },
      ].map((dot) => (
        <motion.circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r="6"
          fill="rgba(255,255,255,0.95)"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.32, 1],
          }}
          transition={{
            duration: 2.8,
            delay: dot.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  )
}
