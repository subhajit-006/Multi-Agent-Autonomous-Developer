import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} Minimalist Landing Page. All rights reserved.</p>
            <div className="footer-links">
              <a href="#" className="nav-link">Privacy</a>
              <a href="#" className="nav-link">Terms</a>
              <a href="#" className="nav-link">Contact</a>
            </div>
            <p className="footer-copyright">
              Built with Next.js and FastAPI
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}