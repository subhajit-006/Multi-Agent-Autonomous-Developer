import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const description =
  'MAAD combines the power of specialized AI agents working in harmony. Each agent (Planner, Coder, Tester, Reviewer) brings unique expertise. The Planner decomposes requirements into actionable tasks, the Coder generates clean, maintainable code, the Tester validates functionality and catches edge cases, and the Reviewer ensures quality and best practices. Every decision, disagreement, and feedback loop is completely transparent—giving you full visibility into how your software is being built.'

export function AboutSection() {
  const [activeCard, setActiveCard] = useState(0)

  return (
    <section
      id="about"
      className="relative py-20 overflow-hidden bg-black border-b border-surface"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center">
          How MAAD <span className="text-lime">Works</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Glow Text */}
          <div className="glow-text space-y-6">
            {description.split(' ').map((word, idx) => (
              <span
                key={idx}
                className="inline-block mr-2 transition-all duration-300 hover:text-lime hover:drop-shadow-[0_0_8px_rgba(212,255,51,0.8)]"
              >
                {word}
              </span>
            ))}
          </div>

          {/* Right Side - Card Swap Animation */}
          <div className="relative h-96">
            {agentCards.map((card, index) => (
              <AgentCard
                key={index}
                card={card}
                isActive={activeCard === index}
                onClick={() => setActiveCard(index)}
              />
            ))}
          </div>
        </div>

        {/* Agent Selector Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {agentCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCard(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === activeCard
                  ? 'bg-lime w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  )
}

const agentCards = [
  {
    name: 'Planner',
    icon: '',
    description: 'Decomposes requirements into actionable tasks',
    color: 'from-lime/20 to-amber/20',
  },
  {
    name: 'Coder',
    icon: '',
    description: 'Generates clean, maintainable code',
    color: 'from-amber/20 to-lime/20',
  },
  {
    name: 'Tester',
    icon: '',
    description: 'Validates functionality and catches edge cases',
    color: 'from-lime/20 to-amber/20',
  },
  {
    name: 'Reviewer',
    icon: '',
    description: 'Ensures quality and best practices',
    color: 'from-amber/20 to-lime/20',
  },
]

function AgentCard({ card, isActive, onClick }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    if (isActive) {
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        pointerEvents: 'auto',
      })
    } else {
      gsap.to(ref.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
        pointerEvents: 'none',
      })
    }
  }, [isActive])

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="absolute inset-0 p-8 rounded-2xl bg-gradient-to-br border border-surface hover:border-lime transition-all cursor-pointer"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(212, 255, 51, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)`,
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="text-5xl mb-4">{card.icon}</div>
      <h3 className="text-2xl font-bold text-lime mb-3">{card.name}</h3>
      <p className="text-gray-400 leading-relaxed">{card.description}</p>
      <div className="mt-6 pt-6 border-t border-surface text-sm text-gray-500">
        Agent Module Ready ✓
      </div>
    </div>
  )
}
