import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const techStack = [
  'React',
  'Python',
  'Claude API',
  'GitHub',
  'Docker',
  'Tailwind CSS',
  'Node.js',
  'PostgreSQL',
  'TypeScript',
  'GSAP',
]

export function TechStackSection() {
  const marqueeRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current || !marqueeRef.current) return

    const marquee = marqueeRef.current
    const content = contentRef.current

    // Clone content for infinite loop
    const clone = content.cloneNode(true)
    marquee.appendChild(clone)

    const totalWidth = content.offsetWidth

    // GSAP animation
    gsap.to(marquee, {
      x: -totalWidth,
      duration: 20,
      repeat: -1,
      ease: 'none',
    })

    return () => {
      gsap.killTweensOf(marquee)
    }
  }, [])

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-black via-slate-dark to-black border-y border-surface">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-bold text-center text-gray-300 mb-4">
          Built with Modern Tech Stack
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-lime to-amber mx-auto"></div>
      </div>

      {/* Curved Marquee */}
      <div
        ref={marqueeRef}
        className="flex gap-8 items-center whitespace-nowrap"
        style={{
          x: 0,
        }}
      >
        <div ref={contentRef} className="flex gap-8">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-6 py-3 rounded-full bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-surface hover:border-lime transition-all hover:shadow-[0_0_20px_rgba(212,255,51,0.2)]"
            >
              <span className="text-lime font-bold">•</span>
              <span className="font-medium text-gray-300">{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
    </section>
  )
}
