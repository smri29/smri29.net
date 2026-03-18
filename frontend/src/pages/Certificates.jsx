import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, ExternalLink } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import API from '../api/axios';

const MotionSection = motion.section;
const MotionArticle = motion.article;

const CERT_CATEGORIES = ['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others'];

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

const getCategoryAnchor = (category) =>
  category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const formatIssueDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await API.get('/data/certificates');
        setCertificates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const scrollToTarget = () => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const timeoutId = window.setTimeout(scrollToTarget, 120);
    return () => window.clearTimeout(timeoutId);
  }, [location.hash, loading]);

  const certsByCategory = useMemo(() => {
    return certificates.reduce((acc, item) => {
      const category = CERT_CATEGORIES.includes(item.category) ? item.category : 'Others';
      acc[category].push(item);
      return acc;
    }, Object.fromEntries(CERT_CATEGORIES.map((category) => [category, []])));
  }, [certificates]);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-[0.12]" />
      <div className="pointer-events-none fixed -left-20 top-0 h-96 w-96 rounded-full bg-cyan-300/12 blur-[110px]" />
      <div className="pointer-events-none fixed right-0 top-40 h-80 w-80 rounded-full bg-amber-200/10 blur-[105px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Portfolio</p>
            <h1 className="font-serif text-3xl text-slate-100 md:text-4xl">
              Professional <span className="text-cyan-200">Certificates</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RouterLink
              to="/#certifications"
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="glass-card mb-10 border-white/10 p-4 md:p-5"
          >
            <div className="flex flex-wrap gap-3">
              {CERT_CATEGORIES.map((category) => {
                if (!(certsByCategory[category] || []).length) return null;
                return (
                  <a
                    key={category}
                    href={`#${getCategoryAnchor(category)}`}
                    className="rounded-full border border-white/10 bg-slate-800/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-cyan-200"
                  >
                    {category}
                  </a>
                );
              })}
            </div>
          </motion.div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading certificates...</p>
          ) : (
            CERT_CATEGORIES.map((category) => {
              const items = certsByCategory[category] || [];
              if (!items.length) return null;

              return (
                <MotionSection
                  key={category}
                  id={getCategoryAnchor(category)}
                  variants={SECTION_VARIANTS}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="mb-14 scroll-mt-28"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <Award className="text-cyan-300" size={24} />
                    <h2 className="text-2xl font-semibold text-slate-100 md:text-3xl">{category}</h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                      <MotionArticle
                        key={item._id}
                        variants={CARD_VARIANTS}
                        className="glass-card card-sheen border-white/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-100">{item.name}</h3>
                            <p className="mt-1 text-sm text-slate-300">{item.issuingOrganization}</p>
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                              {formatIssueDate(item.issueDate)}
                            </p>
                          </div>

                          {item.verificationLink && (
                            <a
                              href={item.verificationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-cyan-300/35 hover:text-cyan-200"
                              aria-label="Verify certificate"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>
                      </MotionArticle>
                    ))}
                  </div>
                </MotionSection>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Certificates;
