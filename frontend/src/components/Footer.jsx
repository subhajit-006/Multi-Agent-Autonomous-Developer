import { Github, Zap } from 'lucide-react'

export function Footer({ onNavigateDocs }) {
  return (
    <footer className="bg-black border-t border-surface py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="maadlogo.png" alt="MAAD Logo" className="w-6 h-6" />
              <div className="text-xl font-bold">
                <span className="text-white">MAAD</span>
                <span className="text-lime ml-2">AI</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Open-Box Multi-Agent Developer
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-lime transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lime transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <button
                  onClick={onNavigateDocs}
                  className="hover:text-lime transition-colors bg-transparent border-none cursor-pointer"
                >
                  Docs
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-lime transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lime transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lime transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Status</h4>
            <div className="flex items-center gap-2 text-sm text-lime">
              <Zap size={16} />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-surface pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm">
            © 2024 MAAD. All rights reserved.
          </p>
          <a
            href="https://github.com"
            className="flex items-center gap-2 text-gray-400 hover:text-lime transition-colors mt-4 md:mt-0"
          >
            <Github size={18} />
            <span className="text-sm">GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
