import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { Menu, X, Download } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'About', to: 'about' },
    { name: 'Skills', to: 'skills' },
    { name: 'Research', to: 'research' },
    { name: 'Projects', to: 'projects' },
    { name: 'Certifications', to: 'certifications' },
    { name: 'Contact', to: 'contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/70 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div 
          className="text-xl font-bold cursor-pointer text-white hover:text-neon-pink transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Shah Mohammad Rizvi
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-8">
          {links.map(link => (
            <Link key={link.to} to={link.to} smooth={true} spy={true} offset={-70} className="text-gray-400 hover:text-neon-pink cursor-pointer transition-colors text-sm font-medium">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* UPDATED: Correct path to /cv.pdf and added 'download' attribute */}
          <a 
            href="/cv.pdf" 
            download="Shah_Mohammad_Rizvi_CV.pdf"
            className="hidden md:flex items-center gap-2 px-5 py-2 bg-neon-pink rounded-full text-sm font-bold hover:scale-105 transition-transform text-white"
          >
            <Download size={16} /> Download CV
          </a>
          
          <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-white/10 p-6 flex flex-col gap-6 lg:hidden">
            {links.map(link => (
            <Link 
                key={link.to} 
                to={link.to} 
                smooth={true} 
                offset={-70} 
                onClick={() => setIsOpen(false)}
                className="text-gray-300 text-lg hover:text-neon-pink cursor-pointer"
            >
              {link.name}
            </Link>
          ))}
           {/* UPDATED: Correct path here as well */}
           <a 
             href="/cv.pdf" 
             download="Shah_Mohammad_Rizvi_CV.pdf"
             className="flex justify-center items-center gap-2 px-5 py-3 bg-neon-pink rounded-lg text-sm font-bold text-white"
            >
            <Download size={16} /> Download CV
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;