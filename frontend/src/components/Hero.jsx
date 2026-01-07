import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowDown, Github, Linkedin, Mail, Brain } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="relative h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        {/* Status Badge */}
        <div className="mb-8 inline-block">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-neon-pink/30 bg-neon-pink/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse"></span>
            <span className="text-[10px] font-mono text-neon-pink tracking-[0.2em] uppercase">Open to Work</span>
          </div>
        </div>

        {/* Name - Single Line, Times New Roman, Reduced Size */}
        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 text-white tracking-tight whitespace-nowrap">
          Shah Mohammad <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-purple-500 to-white">Rizvi</span>
        </h1>

        {/* Typewriter Role */}
        <div className="text-lg md:text-2xl text-gray-400 font-light mb-8 h-8 font-mono">
          <Typewriter
            words={['AI/ML Engineer', 'Researcher', 'Full Stack Developer', 'Founder of CollabCircle']}
            loop={0}
            cursor
            cursorStyle='_'
            typeSpeed={50}
            deleteSpeed={30}
            delaySpeed={2000}
          />
        </div>

        {/* Mission Statement */}
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Bridging the gap between academic research and production engineering. 
          Specializing in Computer Vision, Deep Learning, and Scalable Web Systems.
        </p>

        {/* Social Icons (Moved Above Button for flow) */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-gray-500 hover:text-white hover:scale-110 transition-all duration-300" 
            title="GitHub"
          >
            <Github size={24}/>
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-gray-500 hover:text-white hover:scale-110 transition-all duration-300" 
            title="LinkedIn"
          >
            <Linkedin size={24}/>
          </a>
          <a 
            href="https://www.kaggle.com/shahmohammadrizvi" 
            target="_blank" 
            rel="noreferrer" 
            className="text-gray-500 hover:text-white hover:scale-110 transition-all duration-300" 
            title="Kaggle"
          >
            <Brain size={24}/>
          </a>
        </div>

        {/* Single Main CTA Button - Moved Below */}
        <div>
          <Link 
            to="projects" 
            smooth={true} 
            offset={-50} 
            className="group px-8 py-3 bg-white text-black font-serif font-bold text-sm tracking-wider hover:bg-neon-pink hover:text-white transition-all inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
          >
            View Projects <ArrowDown size={16} className="group-hover:translate-y-1 transition-transform"/>
          </Link>
        </div>

      </motion.div>

    </section>
  );
};

export default Hero;