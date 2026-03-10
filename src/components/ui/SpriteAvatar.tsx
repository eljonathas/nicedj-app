import { useEffect, useRef, useState } from 'react'

interface SpriteAvatarProps {
  src: string
  alt: string
  size: number
  className?: string
  animate?: boolean
  frameCount?: number
  fps?: number
  lazy?: boolean
}

export function SpriteAvatar({
  src,
  alt,
  size,
  className = '',
  animate = false,
  frameCount = 24,
  fps = 14,
  lazy = false,
}: SpriteAvatarProps) {
  const [frame, setFrame] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    startedAtRef.current = null

    if (!animate) {
      setFrame(0)
      return
    }

    const frameDuration = 1000 / fps
    const tick = (timestamp: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = timestamp
      }

      const elapsed = timestamp - startedAtRef.current
      const nextFrame = Math.floor(elapsed / frameDuration) % frameCount

      setFrame((current) => (current === nextFrame ? current : nextFrame))
      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [animate, fps, frameCount])

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        className="pointer-events-none absolute left-0 top-0 select-none"
        style={{
          width: `${size * frameCount}px`,
          height: `${size}px`,
          maxWidth: 'none',
          transform: `translate3d(-${frame * size}px, 0, 0)`,
          willChange: animate ? 'transform' : undefined,
        }}
      />
    </div>
  )
}
