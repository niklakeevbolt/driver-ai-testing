import carTopView from '../assets/illustrations/car-top-view.png'
import stackOfDocumentsAlert from '../assets/illustrations/stack-of-documents-alert.png'

export function CarTopViewIllustration({ alt = '', className, style, ...props }) {
  return (
    <img
      src={carTopView}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

export function StackOfDocumentsIllustration({
  alt = '',
  status = 'alert',
  className,
  style,
  ...props
}) {
  const src = status === 'alert' ? stackOfDocumentsAlert : stackOfDocumentsAlert
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
