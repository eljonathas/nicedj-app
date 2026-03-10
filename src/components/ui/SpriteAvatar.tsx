import { useEffect, useRef } from 'react'

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
  const imgRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    startedAtRef.current = null

    if (!animate) {
      if (imgRef.current) {
        imgRef.current.style.transform = 'translate3d(0px, 0, 0)'
      }
      return
    }

    const frameDuration = 1000 / fps
    let lastFrame = -1

    const tick = (timestamp: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = timestamp
      }

      const elapsed = timestamp - startedAtRef.current
      const nextFrame = Math.floor(elapsed / frameDuration) % frameCount

      if (nextFrame !== lastFrame) {
        lastFrame = nextFrame
        if (imgRef.current) {
          imgRef.current.style.transform = `translate3d(-${nextFrame * size}px, 0, 0)`
        }
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [animate, fps, frameCount, size])

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(255,255,255,0.04)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <img
        ref={imgRef}
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
          transform: 'translate3d(0px, 0, 0)',
        }}
      />
    </div>
  )
}
