import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import meImg from '../assets/me.jpg'; // Import the image

const About = () => {
  const highlights = [
    { icon: <GraduationCap />, title: 'Education', detail: 'BSc in CSE, IUBAT (CGPA 3.82)' },
    { icon: <BookOpen />, title: 'Research', detail: '7+ Publications in ML/CV' },
    { icon: <Award />, title: 'Leadership', detail: 'Founder & President, CollabCircle' },
  ];

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Professional Frame for Headshot */}
            <div className="aspect-[4/5] glass-card overflow-hidden border-2 border-neon-pink/20 relative z-10 group">
               <img 
                 src={meImg} 
                 alt="Shah Mohammad Rizvi" 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-neon-pink/10 -z-0 rounded-2xl"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-neon-pink font-semibold mb-2">Introduction</h2>
            <h3 className="text-4xl font-bold mb-6">Driven by Data, <br/>Defined by <span className="text-neon-pink">Research.</span></h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              I am Shah Mohammad Rizvi, a driven and creative Computer Science & Engineering graduate from IUBAT with a CGPA of 3.82.
              I am now focused on bridging the gap between sophisticated AI/ML research and scalable Full-Stack production systems.
              
              My expertise lies at the intersection of intelligence and implementation.
              I excel in building RAG-based LLM systems and Deep Learning models (Computer Vision & Time-Series), 
              while simultaneously architecting robust web applications using the MERN stack, Next.js, and Docker.
              
              As the Founder of CollabCircle, I lead research-driven initiatives—such as developing GenAI assistants
              and published intrusion detection systems—to transform complex theoretical data into impactful, real-world tools.
              Whether it's optimizing a Transformer model for sub-1ms inference or engineering a real-time bidding platform,
              I am committed to technical excellence, punctual delivery, and continuous innovation.
            </p>

            <div className="grid gap-4">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 glass-card p-4 hover:border-neon-pink/40 transition-colors">
                  <div className="text-neon-pink">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;