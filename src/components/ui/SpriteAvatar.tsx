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
  const [shouldRenderImage, setShouldRenderImage] = useState(!lazy)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!animate) {
      setFrame(0)
      return
    }

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % frameCount)
    }, 1000 / fps)

    return () => window.clearInterval(timer)
  }, [animate, fps, frameCount])

  useEffect(() => {
    if (!lazy || shouldRenderImage || !elementRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderImage(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [lazy, shouldRenderImage])

  return (
    <div
      ref={elementRef}
      role="img"
      aria-label={alt}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: shouldRenderImage ? `url(${src})` : undefined,
        backgroundSize: shouldRenderImage
          ? `${size * frameCount}px ${size}px`
          : undefined,
        backgroundPosition: shouldRenderImage
          ? `-${frame * size}px center`
          : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}
    />
  )
}
