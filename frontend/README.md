<<<<<<< HEAD
# Multi-Agent-Autonomous-Developer
=======
# MAAD - Multi-Agent Autonomous Developer

A professional, high-performance landing page for MAAD, an open-box multi-agent system that builds software from English prompts.

## Features

- **Dark Mode First** with responsive design
- **Professional Industrial Tech Palette** - No purple or blue, using Cyber Lime and Amber accents
- **GSAP Parallax Effects** - Mouse-tracked floating code snippets in hero section
- **Curved Marquee Animation** - Scrolling tech stack showcase
- **Glow Letter Effect** - Interactive text with letter-by-letter illumination
- **Card Swap Animation** - Agent showcase with smooth transitions
- **Glassmorphism Header** - Blur effect on scroll
- **Transparent AI Chat Interface** - Workspace view for agent interaction
- **Scroll Indicators** - Animated scroll down prompts

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **GSAP** - Advanced animations and parallax
- **Framer Motion** - Smooth transitions
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Header.jsx           # Navigation header with glassmorphism
│   ├── HeroSection.jsx       # Hero with parallax & scroll indicator
│   ├── TechStackSection.jsx  # Curved marquee animation
│   ├── AboutSection.jsx      # Glow text & card swap
│   ├── CtaSection.jsx        # Call-to-action button
│   ├── Footer.jsx            # Footer links
│   └── WorkspaceView.jsx     # AI chat interface
├── App.jsx                   # Main app component
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

## Key Components

### Hero Section
- GSAP parallax effect with mouse tracking
- Floating code snippet animations
- Animated scroll indicator
- Responsive typography

### About Section
- Split layout design
- Individual letter glow effect on hover
- Card stack animation for agent showcase
- Interactive agent selector

### Workspace View
- Claude/Perplexity-style chat interface
- Sidebar with conversation history
- Real-time message display
- Agent identification badges

## Color Palette

- **Background**: `#0A0A0A` (Pure Dark)
- **Surface**: `#171717` (Elevated cards)
- **Border**: `#262626` (Subtle separation)
- **Accent Lime**: `#D4FF33` (Primary highlight)
- **Accent Amber**: `#FFA500` (Secondary highlight)

## Performance Optimizations

- GSAP animations are cleaned up on component unmount
- Marquee uses efficient cloning and transforms
- CSS grid-based layouts for better performance
- Lazy animation initialization

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please follow the existing code style and ensure animations are performant.

## License

MIT

## Credits

Built with ❤️ for the MAAD project - transparent AI software engineering.
>>>>>>> 611d112 (Initial commit - project upload)
