import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await API.get('/data/skills');
        setSkillCategories(data);
      } catch (err) {
        console.error("Failed to load skills", err);
      }
    };
    fetchSkills();
  }, []);

  return (
    <section id="skills" className="py-24 px-6 bg-black/20">
      <div className="max-w-6xl mx-auto text-white">
        <h2 className="text-3xl font-bold mb-12 text-center">Technical <span className="text-neon-pink">Proficiency</span></h2>
        
        {skillCategories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((cat) => (
              <div key={cat._id} className="glass-card p-8 border-t-4 border-t-neon-pink/50 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-6">{cat.category}</h3>
                <div className="flex flex-wrap gap-2 content-start">
                  {cat.skillsList.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:border-neon-pink/50 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 italic">
            Skills are loading or haven't been added to the dashboard yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;