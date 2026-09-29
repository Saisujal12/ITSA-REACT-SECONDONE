import { useState } from 'react'
import { resolveImage } from '../../utils/assets'
import { cx } from '../../utils/cx'
import s from './ImageWithFallback.module.css'

/**
 * Renders an image from an asset key (see utils/assets.js) and swaps in
 * `fallback` when the file is missing or fails to load. Images fade in once
 * loaded, like the legacy poster/QR behaviour.
 */
export default function ImageWithFallback({
  imageKey,
  alt,
  fallback = null,
  className,
  sizes,
  loading = 'lazy',
  fade = true,
  ...imgProps
}) {
  const image = resolveImage(imageKey)
  const src = image?.src
  const [failedSrc, setFailedSrc] = useState(null)
  const [loadedSrc, setLoadedSrc] = useState(null)

  if (!src || failedSrc === src) return fallback

  return (
    <img
      key={src}
      src={src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      className={cx(className, fade && s.fade, fade && loadedSrc === src && s.loaded)}
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
      {...imgProps}
    />
  )
}
