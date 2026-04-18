import { Github } from 'lucide-react'

export function Header({ scrollY, onNavigateDocs }) {
  const isScrolled = scrollY > 50

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
<div className="flex items-center gap-3">
        <img src="/maadlogo.png" alt="MAAD Logo" className="w-8 h-8" />
        <div className="text-2xl font-bold tracking-wider">
          <span className="text-white">MAAD</span>
          <span className="text-lime ml-2">AI</span>
        </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8 text-sm text-gray-300">
          <a
            href="#home"
            className="hover:text-lime transition-colors duration-300"
          >
            Home
          </a>
          <a
            href="#about"
            className="hover:text-lime transition-colors duration-300"
          >
            About
          </a>
          <button
            onClick={onNavigateDocs}
            className="hover:text-lime transition-colors duration-300 bg-transparent border-none cursor-pointer"
          >
            Document
          </button>
        </nav>

        {/* GitHub Login Button */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lime text-lime hover:bg-lime hover:text-black transition-all duration-300 font-medium text-sm">
          <Github size={18} />
          <span>Login with GitHub</span>
        </button>
      </div>
    </header>
  )
}
