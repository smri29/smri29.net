import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { Menu, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Skills', to: 'skills' },
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

        <div className="hidden md:flex gap-8">
          {links.map(link => (
            <Link key={link.to} to={link.to} smooth={true} spy={true} offset={-70} className="text-gray-400 hover:text-neon-pink cursor-pointer transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a href="/resume.pdf" className="hidden md:flex items-center gap-2 px-5 py-2 bg-neon-pink rounded-full text-sm font-bold hover:scale-105 transition-transform">
            <Download size={16} /> Download CV
          </a>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;