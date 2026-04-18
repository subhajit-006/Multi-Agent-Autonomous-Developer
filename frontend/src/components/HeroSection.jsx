import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import gsap from 'gsap'

const codeSnippets = [
  { code: 'const plan = await planner.analyze();', color: '#D4FF33' },
  { code: 'const code = await coder.generate();', color: '#FFA500' },
  { code: 'const tests = await tester.validate();', color: '#D4FF33' },
  { code: 'const review = await reviewer.approve();', color: '#FFA500' },
]

export function HeroSection({ scrollY }) {
  const containerRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 2,
        y: (clientY / innerHeight - 0.5) * 2,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-slate-dark via-black to-black flex items-center justify-center"
    >
      {/* Parallax Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(212, 255, 51, 0.05) 25%, rgba(212, 255, 51, 0.05) 26%, transparent 27%, transparent 74%, rgba(212, 255, 51, 0.05) 75%, rgba(212, 255, 51, 0.05) 76%, transparent 77%, transparent),
                             linear-gradient(90deg, transparent 24%, rgba(212, 255, 51, 0.05) 25%, rgba(212, 255, 51, 0.05) 26%, transparent 27%, transparent 74%, rgba(212, 255, 51, 0.05) 75%, rgba(212, 255, 51, 0.05) 76%, transparent 77%, transparent)`,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Floating Code Snippets */}
      <div className="absolute inset-0 pointer-events-none">
        {codeSnippets.map((snippet, i) => (
          <FloatingCodeSnippet
            key={i}
            snippet={snippet}
            index={i}
            mousePosition={mousePosition}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
          <span className="text-white">The Open-Box</span>
          <br />
          <span className="text-lime">Multi-Agent Developer</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Planner. Coder. Tester. Reviewer.{' '}
          <span className="text-lime">Transparent</span> software engineering by
          specialized AI agents.
        </p>

        {/*<button className="px-8 py-3 rounded-lg bg-lime text-black font-semibold hover:shadow-[0_0_30px_rgba(212,255,51,0.3)] transition-all duration-300 mb-16">
          Start Building
        </button>*/}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-sm uppercase tracking-widest">Scroll to explore</span>
          <div className="animate-scroll-down">
            <ChevronDown size={24} className="text-lime" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FloatingCodeSnippet({ snippet, index, mousePosition }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      x: mousePosition.x * (15 + index * 5),
      y: mousePosition.y * (15 + index * 5),
      duration: 0.8,
      ease: 'power2.out',
    })
  }, [mousePosition, index])

  const positions = [
    { top: '15%', left: '10%' },
    { top: '70%', right: '15%' },
    { bottom: '20%', left: '5%' },
    { top: '40%', right: '10%' },
  ]

  return (
    <div
      ref={ref}
      className="absolute text-xs font-mono p-3 rounded-lg border border-gray-700 bg-gray-900/40 backdrop-blur-sm text-gray-300 whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
      style={positions[index]}
    >
      <span style={{ color: snippet.color }}>&gt;</span> {snippet.code}
    </div>
  )
}
