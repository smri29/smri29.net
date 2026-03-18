import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { Download, Menu, X } from 'lucide-react';

const MotionDiv = motion.div;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = useMemo(
    () => [
      { name: 'About', to: 'about' },
      { name: 'Experience', to: 'experience' },
      { name: 'Projects', to: 'projects' },
      { name: 'Research', to: 'research' },
      { name: 'Skills', to: 'skills' },
      { name: 'Certifications', to: 'certifications' },
      { name: 'Hobbies', to: 'hobbies' },
      { name: 'Contact', to: 'contact' },
    ],
    []
  );

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-slate-900/72 py-3 backdrop-blur-xl'
          : 'border-transparent bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
        <button
          className="group inline-flex items-center gap-3 text-left"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          type="button"
          aria-label="Scroll to top"
        >
          <img src="/smr.svg" alt="SMR mark" className="h-8 w-8 rounded-md border border-cyan-300/30 bg-slate-800/65 p-1" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-300/80">Portfolio</p>
            <p className="font-serif text-lg text-slate-100 group-hover:text-cyan-200">Shah Mohammad Rizvi</p>
          </div>
        </button>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-900/32 px-3 py-2 backdrop-blur-md xl:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              smooth
              spy
              offset={-80}
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
              activeClass="text-cyan-300"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/cv.pdf"
            download="Shah_Mohammad_Rizvi_CV.pdf"
            className="hidden items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-cyan-200 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-300 hover:text-slate-950 md:inline-flex"
          >
            <Download size={14} />
            Resume
          </a>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-300 xl:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-t border-white/10 bg-slate-900/90 px-6 py-5 backdrop-blur-xl xl:hidden"
          >
            <div className="grid gap-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  smooth
                  offset={-74}
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer rounded-lg border border-transparent px-3 py-2 text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
