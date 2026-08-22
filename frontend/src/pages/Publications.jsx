import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import API from '../api/axios';
import { trackAnalyticsEvent } from '../analytics/tracker';
import InteractiveNetworkBackground from '../components/InteractiveNetworkBackground';
import SiteFooter from '../components/SiteFooter';

const MotionSection = motion.section;
const MotionArticle = motion.article;

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
      staggerChildren: 0.06,
    },
  },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const formatPublicationDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const Publications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data } = await API.get('/data/research');
        setPublications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const sortedPublications = useMemo(
    () =>
      [...publications].sort((a, b) => {
        const aTime = a?.publicationDate ? new Date(a.publicationDate).getTime() : 0;
        const bTime = b?.publicationDate ? new Date(b.publicationDate).getTime() : 0;
        return bTime - aTime;
      }),
    [publications]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <InteractiveNetworkBackground />
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-[0.12]" />
      <div className="pointer-events-none fixed -left-20 top-0 h-96 w-96 rounded-full bg-cyan-300/12 blur-[110px]" />
      <div className="pointer-events-none fixed right-0 top-40 h-80 w-80 rounded-full bg-amber-200/10 blur-[105px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h1 className="font-serif text-3xl text-slate-100 md:text-4xl">
              <span className="text-cyan-200">Publications</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-200"
            >
              <ArrowLeft size={15} />
              Back to Home
            </RouterLink>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <p className="text-sm text-slate-400">Loading publications...</p>
          ) : sortedPublications.length === 0 ? (
            <p className="text-sm text-slate-400">No publications added yet.</p>
          ) : (
            <MotionSection
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <BookOpen className="text-cyan-300" size={24} />
                <h2 className="text-2xl font-semibold text-slate-100 md:text-3xl">All Publications</h2>
              </div>

              <div className="glass-card border-white/10 p-4 md:p-5">
                {sortedPublications.map((item, index) => {
                  const authors = Array.isArray(item.authors) ? item.authors.filter(Boolean) : [];
                  const publicationDate = formatPublicationDate(item.publicationDate);

                  return (
                    <MotionArticle
                      key={item._id}
                      variants={CARD_VARIANTS}
                      className={`px-1 py-5 transition duration-300 md:px-2 ${
                        index !== sortedPublications.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-snug text-slate-100">{item.title}</h3>
                          {item.publicationName && (
                            <p className="mt-2 text-sm text-cyan-200">{item.publicationName}</p>
                          )}
                          {authors.length > 0 && (
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">{authors.join(', ')}</p>
                          )}
                        </div>

                        <div className="shrink-0 text-left md:min-w-[180px] md:text-right">
                          {publicationDate && <p className="text-sm text-slate-300">{publicationDate}</p>}
                          {item.doiLink && (
                            <a
                              href={item.doiLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => trackAnalyticsEvent('click', 'research_publication_click', {
                                title: item.title,
                                page: 'publications',
                              })}
                              className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100 md:justify-end"
                            >
                              Link <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </MotionArticle>
                  );
                })}
              </div>
            </MotionSection>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Publications;
