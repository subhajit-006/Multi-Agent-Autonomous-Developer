import { ArrowLeft, Code2, Zap, Users, FileText } from 'lucide-react'

export function DocumentsPage({ onClose }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Back Button */}
      <div className="fixed top-0 w-full z-40 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-lime hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold">MAAD Documentation</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Hero Section */}
          <div className="mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Multi-Agent Autonomous Developer
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              MAAD is an innovative, transparent multi-agent system that builds
              software directly from English prompts. Unlike traditional AI coding
              tools, MAAD is completely open-box—every agent decision, disagreement,
              and feedback loop is visible to the user, providing unprecedented
              transparency in AI-driven software development.
            </p>
          </div>

          {/* Project Overview */}
          <DocSection
            title="Project Overview"
            icon={<FileText className="text-lime" size={28} />}
          >
            <p className="mb-4 text-gray-300">
              MAAD revolutionizes software engineering by orchestrating four
              specialized AI agents to work collaboratively:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-lime font-bold">•</span>
                <span>
                  <strong>Planner Agent:</strong> Analyzes requirements and
                  decomposes them into actionable subtasks and milestones
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lime font-bold">•</span>
                <span>
                  <strong>Coder Agent:</strong> Generates clean, maintainable,
                  production-ready code following best practices
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lime font-bold">•</span>
                <span>
                  <strong>Tester Agent:</strong> Validates functionality, writes
                  comprehensive tests, and catches edge cases
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lime font-bold">•</span>
                <span>
                  <strong>Reviewer Agent:</strong> Ensures code quality, security,
                  and adherence to best practices
                </span>
              </li>
            </ul>
          </DocSection>

          {/* How It Works */}
          <DocSection
            title="How It Works"
            icon={<Zap className="text-lime" size={28} />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-lime mb-2">
                  1. Input Processing
                </h4>
                <p className="text-gray-300">
                  User submits a project idea or requirements in natural English.
                  MAAD parses and understands the context, scope, and constraints.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-lime mb-2">
                  2. Planning Phase
                </h4>
                <p className="text-gray-300">
                  The Planner Agent creates a detailed project blueprint, breaking
                  requirements into components, dependencies, and implementation tasks.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-lime mb-2">
                  3. Code Generation
                </h4>
                <p className="text-gray-300">
                  The Coder Agent generates implementation based on the plan, writing
                  modular, documented, and tested code.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-lime mb-2">
                  4. Testing & Validation
                </h4>
                <p className="text-gray-300">
                  The Tester Agent runs comprehensive tests, identifies failures, and
                  reports issues back to the Coder for fixes.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-lime mb-2">
                  5. Code Review
                </h4>
                <p className="text-gray-300">
                  The Reviewer Agent analyzes code quality, security vulnerabilities,
                  and best practice compliance, providing constructive feedback.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-lime mb-2">
                  6. Transparent Iteration
                </h4>
                <p className="text-gray-300">
                  All agent feedback, disagreements, and decision-making processes are
                  logged and visible. Users see exactly how their software is being built.
                </p>
              </div>
            </div>
          </DocSection>

          {/* Tech Stack */}
          <DocSection
            title="Technology Stack"
            icon={<Code2 className="text-lime" size={28} />}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-amber mb-4">
                  Backend & AI
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>Claude API</strong> - Advanced language models for
                      agents
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>Python</strong> - Core backend logic and agent
                      orchestration
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>Node.js</strong> - API server and real-time
                      communication
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>PostgreSQL</strong> - Persistent data and decision
                      logs
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-amber mb-4">
                  Frontend & DevOps
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>React</strong> - Modern UI framework with Hooks
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>Tailwind CSS</strong> - Utility-first styling
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>GSAP</strong> - Advanced animations and parallax
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>Docker</strong> - Containerization and deployment
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lime">→</span>
                    <span>
                      <strong>GitHub</strong> - Version control and CI/CD
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </DocSection>

          {/* Languages Supported */}
          <DocSection title="Supported Languages">
            <div className="grid md:grid-cols-3 gap-4">
              {['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust'].map(
                (lang) => (
                  <div
                    key={lang}
                    className="p-4 rounded-lg bg-gray-900/50 border border-surface hover:border-lime transition-all"
                  >
                    <p className="font-semibold text-lime">{lang}</p>
                  </div>
                )
              )}
            </div>
          </DocSection>

          {/* Team & Credits */}
          <DocSection
            title="Team & Credits"
            icon={<Users className="text-lime" size={28} />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-amber mb-3">
                  Core Team
                </h4>
                <p className="text-gray-300 mb-4">
                  MAAD is developed by a dedicated team of AI researchers, software
                  engineers, and product designers committed to building transparent,
                  trustworthy AI systems for software development.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <TeamMember
                  role="AI/ML Lead"
                  description="Architected the multi-agent orchestration system and LLM integration"
                />
                <TeamMember
                  role="Backend Engineer"
                  description="Built scalable infrastructure and decision logging system"
                />
                <TeamMember
                  role="Frontend Engineer"
                  description="Created the transparent UI for decision visualization"
                />
                <TeamMember
                  role="Product Manager"
                  description="Shaped vision for transparent AI-driven development"
                />
              </div>

              <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-lime/10 to-amber/10 border border-surface">
                <p className="text-sm text-gray-400">
                  <strong className="text-lime">Open Source:</strong> MAAD is
                  committed to open-source principles. Visit our GitHub repository to
                  explore the code, contribute, or file issues.
                </p>
              </div>
            </div>
          </DocSection>

          {/* Key Features */}
          <DocSection title="Key Features">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Full Transparency',
                  desc: 'Every decision logged and visible to users',
                },
                {
                  title: 'Multi-Agent Collaboration',
                  desc: 'Specialized agents working in harmony',
                },
                {
                  title: 'Real-time Feedback',
                  desc: 'Watch progress as it happens',
                },
                {
                  title: 'Quality Assurance',
                  desc: 'Automated testing and code review',
                },
                {
                  title: 'Production Ready',
                  desc: 'Code follows industry best practices',
                },
                {
                  title: 'Scalable Architecture',
                  desc: 'Handles projects of any complexity',
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-gray-900/50 border border-surface hover:border-lime transition-all"
                >
                  <h4 className="font-semibold text-lime mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </DocSection>

          {/* Getting Started */}
          <DocSection title="Getting Started">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-surface">
              <p className="text-gray-300 mb-4">
                Ready to build with MAAD? Here's how to get started:
              </p>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-lime font-bold">1.</span>
                  <span>Sign up or login with your GitHub account</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lime font-bold">2.</span>
                  <span>Create a new project and describe your idea in English</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lime font-bold">3.</span>
                  <span>Select your tech stack and project preferences</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lime font-bold">4.</span>
                  <span>Watch MAAD's agents collaborate in real-time</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lime font-bold">5.</span>
                  <span>Review decisions and deploy your generated code</span>
                </li>
              </ol>
            </div>
          </DocSection>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2024 MAAD. Documentation and source code available on GitHub.</p>
        </div>
      </footer>
    </div>
  )
}

function DocSection({ title, icon, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-3xl font-bold">{title}</h3>
      </div>
      <div className="bg-gray-900/30 border border-surface rounded-lg p-6">
        {children}
      </div>
    </section>
  )
}

function TeamMember({ role, description }) {
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-surface hover:border-lime transition-all">
      <h5 className="font-semibold text-lime mb-2">{role}</h5>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )
}
