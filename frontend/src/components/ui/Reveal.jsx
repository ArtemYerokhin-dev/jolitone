import { useInView } from '../../hooks/useInView'

export default function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : ''

  return (
    <div ref={ref} className={`reveal ${delayClass} ${inView ? 'is-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  )
}
