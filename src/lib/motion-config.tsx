/**
 * Configurações otimizadas para Framer Motion
 * Reduz JavaScript e melhora performance
 */

import { LazyMotion, domAnimation, m } from 'framer-motion'

/**
 * LazyMotion reduz bundle em ~30KB
 * Use <m.div> ao invés de <motion.div>
 */
export function OptimizedMotion({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}

/**
 * Variantes otimizadas - evite recalcular
 */
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // easeOutExpo
    }
  }
}

export const slideInVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

/**
 * Hook para detectar prefere movimento reduzido
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}

/**
 * Exemplo de uso otimizado:
 */
export function OptimizedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <OptimizedMotion>
      <m.div
        variants={fadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }} // Trigger antes
        {...(shouldReduceMotion && { initial: 'visible' })} // Pula animação
      >
        Conteúdo
      </m.div>
    </OptimizedMotion>
  )
}
