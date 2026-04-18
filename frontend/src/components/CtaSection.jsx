export function CtaSection({ onShowIdea }) {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-black to-slate-dark border-b border-surface">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212, 255, 51, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Ready to Build <span className="text-lime">Transparently</span>?
        </h2>

        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload your idea or project requirements and let MAAD's multi-agent system
          start working. Watch every decision in real-time through our transparent
          decision log.
        </p>

        <button
          onClick={onShowIdea}
          className="group relative px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #D4FF33 0%, #FFA500 100%)',
            color: '#000',
            boxShadow: '0 0 0 2px #D4FF33, 0 0 30px rgba(212, 255, 51, 0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 2px #D4FF33, 0 0 30px rgba(212, 255, 51, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 2px #D4FF33, 0 0 30px rgba(212, 255, 51, 0)'
          }}
        >
          <span className="relative z-10">Start Building</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { title: 'Transparent', desc: 'See every agent decision' },
            { title: 'Real-time', desc: 'Watch progress as it happens' },
            { title: 'Collaborative', desc: '4 specialized AI agents' },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-gray-900/40 border border-surface hover:border-lime transition-all"
            >
              <h3 className="text-lime font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
