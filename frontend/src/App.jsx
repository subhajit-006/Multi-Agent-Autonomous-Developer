import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { TechStackSection } from './components/TechStackSection'
import { AboutSection } from './components/AboutSection'
import { CtaSection } from './components/CtaSection'
import { Footer } from './components/Footer'
import { WorkspaceView } from './components/WorkspaceView'
import { DocumentsPage } from './components/DocumentsPage'

export default function App() {
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (showWorkspace) {
    return <WorkspaceView onClose={() => setShowWorkspace(false)} />
  }

  if (showDocuments) {
    return <DocumentsPage onClose={() => setShowDocuments(false)} />
  }

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Header scrollY={scrollY} onNavigateDocs={() => setShowDocuments(true)} />
      <HeroSection scrollY={scrollY} />
      <TechStackSection />
      <AboutSection />
      <CtaSection onShowIdea={() => setShowWorkspace(true)} />
      <Footer onNavigateDocs={() => setShowDocuments(true)} />
    </div>
  )
}
