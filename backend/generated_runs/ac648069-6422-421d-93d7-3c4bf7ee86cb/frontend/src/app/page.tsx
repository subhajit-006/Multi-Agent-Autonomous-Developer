import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minimal Single-File Landing Page',
  description: 'A self-contained, lightweight HTML landing page with embedded CSS and JavaScript, optimized for fast loading and simplicity without external dependencies.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-primary-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Minimal Single-File Landing Page</h1>
          <p className="text-xl">Fast, lightweight, and dependency-free</p>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Built for Performance</h2>
            <p className="text-gray-600 leading-relaxed">
              This landing page is optimized for speed with embedded CSS and JavaScript,
              semantic HTML5 structure, and no external dependencies.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Semantic HTML5 structure
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Responsive design with Flexbox/Grid
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Cross-browser compatibility
              </li>
            </ul>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Try It Now</h3>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              >
                Get Started
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Minimal Single-File Landing Page. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}