'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">
            Minimalist
          </Link>

          <button
            className="hamburger"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span className="hamburger-box">
              <span className={`hamburger-inner ${isMenuOpen ? 'hamburger-inner-open' : ''}`}></span>
            </span>
          </button>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Features
                </Link>
              </li>
              <li className="nav-item">
                <Link href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}