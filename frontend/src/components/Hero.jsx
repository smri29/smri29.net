import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowRight, Github, Linkedin, FileText } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center px-6 md:px-12 pt-20 overflow-hidden">
      
      {/* Background Grid for "Technical" Feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Text Content (7 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:col-span-7 flex flex-col justify-center"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 mb-6 w-fit px-3 py-1 rounded-full border border-neon-pink/30 bg-neon-pink/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse"></span>
            <span className="text-xs font-mono text-neon-pink tracking-widest uppercase">Open to Work</span>
          </div>

          {/* Name in Times New Roman (Serif) */}
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight mb-6">
            Shah M. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-purple-500 to-white">Rizvi</span>
          </h1>

          {/* Role & Mission */}
          <div className="text-xl md:text-2xl text-gray-400 font-light mb-8 h-20 md:h-auto">
            <span className="text-white font-medium mr-2">I am a</span>
            <span className="text-neon-pink font-mono">
               <Typewriter
                words={['Machine Learning Researcher.', 'Founder of CollabCircle.', 'Full Stack Engineer.']}
                loop={0}
                cursor
                cursorStyle='_'
                typeSpeed={50}
                deleteSpeed={30}
                delaySpeed={2000}
              />
            </span>
            <p className="text-sm md:text-base text-gray-500 mt-4 max-w-lg leading-relaxed font-sans">
              Bridging the gap between academic research and production engineering. 
              Specializing in Computer Vision, Deep Learning, and Scalable Web Systems.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link 
              to="projects" 
              smooth={true} 
              offset={-50} 
              className="group px-8 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-neon-pink hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              View Research <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            
            <div className="flex items-center gap-4 px-6 border-l border-white/20">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Github size={20}/></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20}/></a>
              <a href="/resume.pdf" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Resume"><FileText size={20}/></a>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Abstract Visual (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-5 relative hidden md:block"
        >
          {/* This is a CSS-only abstract shape resembling a neural network node or data point */}
          <div className="relative w-full aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-pink/20 to-purple-600/20 rounded-full blur-[80px] animate-pulse-slow"></div>
            <div className="relative z-10 glass-card p-8 border-t border-l border-white/10 rounded-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="font-mono text-xs text-neon-pink mb-4">latest_research.py</div>
               <div className="space-y-2">
                  <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                  <div className="h-2 w-full bg-white/10 rounded"></div>
                  <div className="h-2 w-5/6 bg-white/10 rounded"></div>
                  <div className="h-2 w-1/2 bg-white/10 rounded"></div>
               </div>
               <div className="mt-8 flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-serif font-bold">7+</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500">Publications</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-serif font-bold">3.82</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500">CGPA</div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;