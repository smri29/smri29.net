import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Cpu } from 'lucide-react';

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await API.get('/data/skills');
        setSkillCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load skills', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section id="skills" className="border-t border-white/5 bg-slate-950/35 px-6 py-24 backdrop-blur-sm md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center gap-3">
          <Cpu className="text-cyan-300" size={28} />
          <h2 className="section-title">
            Technical <span className="text-cyan-200">Proficiency</span>
          </h2>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading skills...</p>
        ) : skillCategories.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skillCategories.map((cat) => (
              <article
                key={cat._id}
                className="glass-card flex h-full flex-col border-white/10 p-6 transition hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <h3 className="mb-5 text-xl font-semibold text-slate-100">{cat.category}</h3>
                <div className="flex flex-wrap gap-2 content-start">
                  {(cat.skillsList || []).map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="rounded-full border border-white/15 bg-slate-800/60 px-3 py-1 text-xs text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">Skills have not been added yet.</p>
        )}
      </div>
    </section>
  );
};

export default Skills;
