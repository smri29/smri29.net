const { GoogleGenerativeAI } = require('@google/generative-ai');
const AISettings = require('../models/AISettings');
const HeroContent = require('../models/HeroContent');
const Introduction = require('../models/Introduction');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Project = require('../models/Project');
const Research = require('../models/Research');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Hobby = require('../models/Hobby');

const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_PROMPT_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 8;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const DEFAULT_AI_SETTINGS = {
  assistantName: 'RAI',
  assistantSubtitle: "Rizvi's personalized AI",
  primaryGoal: 'Help recruiters, hiring managers, and collaborators evaluate Shah Mohammad Rizvi accurately.',
  currentRole: '',
  location: '',
  opportunityFocus: '',
  contactEmail: '',
  portfolioUrl: '',
  linkedinUrl: '',
  githubUrl: '',
  kaggleUrl: '',
  facebookUrl: '',
  responseStyle:
    'Professional, clear, concise, and recruiter-friendly. Keep answers short by default. Use direct facts. If information is missing, say so clearly.',
  knowledgeBase: '',
  responseRules:
    'Use the knowledge base as the source of truth. Do not invent roles, achievements, dates, links, metrics, or claims. If information is missing, say so clearly. Keep answers concise by default. Avoid markdown formatting such as headings, bold, italics, or code fences. For lists, use plain-text bullets starting with "-".',
  additionalKnowledge: '',
  fallbackReply:
    "I'm currently updating my knowledge base. Please check Rizvi's profile sections or contact details for the latest information.",
};

const normalizeString = (value, maxLength = 5000) => String(value ?? '').trim().slice(0, maxLength);
const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item, 200)).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => normalizeString(item, 200))
    .filter(Boolean);
};

const isValidUrl = (value) => {
  const url = normalizeString(value, 2048);
  if (!url) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item?.role === 'user' ? 'User' : 'Assistant',
      text: String(item?.text || '').trim().slice(0, 600),
    }))
    .filter((item) => item.text.length > 0);
};

const formatHistory = (history) => {
  if (!history.length) {
    return 'No prior conversation context.';
  }

  return history.map((item) => `${item.role}: ${item.text}`).join('\n');
};

const serializeAISettings = (item) => ({
  assistantName: item?.assistantName || DEFAULT_AI_SETTINGS.assistantName,
  assistantSubtitle: item?.assistantSubtitle || DEFAULT_AI_SETTINGS.assistantSubtitle,
  primaryGoal: item?.primaryGoal || DEFAULT_AI_SETTINGS.primaryGoal,
  currentRole: item?.currentRole || '',
  location: item?.location || '',
  opportunityFocus: item?.opportunityFocus || '',
  contactEmail: item?.contactEmail || '',
  portfolioUrl: item?.portfolioUrl || '',
  linkedinUrl: item?.linkedinUrl || '',
  githubUrl: item?.githubUrl || '',
  kaggleUrl: item?.kaggleUrl || '',
  facebookUrl: item?.facebookUrl || '',
  responseStyle: item?.responseStyle || DEFAULT_AI_SETTINGS.responseStyle,
  knowledgeBase: item?.knowledgeBase || item?.additionalKnowledge || '',
  responseRules: item?.responseRules || DEFAULT_AI_SETTINGS.responseRules,
  additionalKnowledge: item?.additionalKnowledge || '',
  fallbackReply: item?.fallbackReply || DEFAULT_AI_SETTINGS.fallbackReply,
  updatedAt: item?.updatedAt,
});

const formatSection = (title, items) => {
  const safeItems = items.map((item) => normalizeString(item, 800)).filter(Boolean);
  if (!safeItems.length) {
    return '';
  }

  return `${title}\n${safeItems.map((item) => `- ${item}`).join('\n')}`;
};

const buildKnowledgeBase = ({
  settings,
  hero,
  introduction,
  experience,
  education,
  projects,
  research,
  certificates,
  skills,
  hobbies,
}) => {
  const introHighlights = Array.isArray(introduction?.highlights)
    ? introduction.highlights.map((item) => `${item.title}: ${item.detail}`)
    : [];

  const skillSections = Array.isArray(skills)
    ? skills.map((item) => {
        const values = Array.isArray(item.skillsList) ? item.skillsList.filter(Boolean).join(', ') : '';
        return values ? `${item.category}: ${values}` : item.category;
      })
    : [];

  const sections = [
    `You are ${settings.assistantName}, ${settings.assistantSubtitle}.`,
    `PRIMARY GOAL\n- ${settings.primaryGoal}`,
    formatSection('ADMIN PROFILE CONTEXT', [
      settings.currentRole && `Current Role: ${settings.currentRole}`,
      settings.location && `Location: ${settings.location}`,
      settings.opportunityFocus && `Opportunity Focus: ${settings.opportunityFocus}`,
      settings.contactEmail && `Email: ${settings.contactEmail}`,
      settings.portfolioUrl && `Portfolio: ${settings.portfolioUrl}`,
      settings.linkedinUrl && `LinkedIn: ${settings.linkedinUrl}`,
      settings.githubUrl && `GitHub: ${settings.githubUrl}`,
      settings.kaggleUrl && `Kaggle: ${settings.kaggleUrl}`,
      settings.facebookUrl && `Facebook: ${settings.facebookUrl}`,
    ]),
    settings.knowledgeBase ? `ADMIN-CURATED KNOWLEDGE BASE\n${settings.knowledgeBase}` : '',
    formatSection('HERO SECTION', [
      hero?.availabilityText && `Availability: ${hero.availabilityText}`,
      Array.isArray(hero?.roleTitles) && hero.roleTitles.length > 0
        ? `Role Titles: ${hero.roleTitles.join(', ')}`
        : '',
      hero?.summary,
    ]),
    formatSection('INTRODUCTION SECTION', [
      introduction?.introLabel && `Label: ${introduction.introLabel}`,
      introduction?.headingPrimary && `Primary Heading: ${introduction.headingPrimary}`,
      introduction?.headingAccent && `Accent Heading: ${introduction.headingAccent}`,
      introduction?.description,
      ...introHighlights,
    ]),
    formatSection(
      'WORK EXPERIENCE',
      (experience || []).map((item) => {
        const dateRange =
          item.startDate || item.endDate
            ? `${item.startDate ? String(item.startDate).slice(0, 10) : ''} to ${
                item.currentlyWorking ? 'Present' : item.endDate ? String(item.endDate).slice(0, 10) : ''
              }`
            : '';
        return [
          item.jobTitle || item.role,
          item.companyName || item.company,
          item.location,
          dateRange,
          item.description,
        ]
          .filter(Boolean)
          .join(' | ');
      })
    ),
    formatSection(
      'EDUCATION',
      (education || []).map((item) =>
        [item.degree, item.institution, item.grade && `Grade: ${item.grade}`, item.year]
          .filter(Boolean)
          .join(' | ')
      )
    ),
    formatSection(
      'PROJECTS',
      (projects || []).slice(0, 12).map((item) =>
        [
          item.projectName,
          item.category,
          item.role,
          Array.isArray(item.techStack) && item.techStack.length > 0
            ? `Tech: ${item.techStack.join(', ')}`
            : '',
          item.description,
        ]
          .filter(Boolean)
          .join(' | ')
      )
    ),
    formatSection(
      'RESEARCH PUBLICATIONS',
      (research || []).slice(0, 12).map((item) =>
        [
          item.title,
          item.type,
          item.publicationName,
          item.publicationDate ? String(item.publicationDate).slice(0, 10) : '',
          Array.isArray(item.authors) && item.authors.length > 0
            ? `Authors: ${item.authors.join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join(' | ')
      )
    ),
    formatSection(
      'CERTIFICATIONS',
      (certificates || []).slice(0, 12).map((item) =>
        [item.name, item.issuingOrganization, item.category, item.issueDate ? String(item.issueDate).slice(0, 10) : '']
          .filter(Boolean)
          .join(' | ')
      )
    ),
    formatSection('SKILLS', skillSections),
    formatSection(
      'INTERESTS AND HOBBIES',
      (hobbies || []).map((item) => [item.name, item.description].filter(Boolean).join(' | '))
    ),
    settings.additionalKnowledge ? `SUPPLEMENTAL KNOWLEDGE\n${settings.additionalKnowledge}` : '',
    `RESPONSE STYLE\n${settings.responseStyle}`,
    `RESPONSE RULES\n${settings.responseRules}`,
  ];

  return sections.filter(Boolean).join('\n\n');
};

const fetchKnowledgeContext = async () => {
  const [
    settingsDoc,
    hero,
    introduction,
    experience,
    education,
    projects,
    research,
    certificates,
    skills,
    hobbies,
  ] = await Promise.all([
    AISettings.findOne().lean(),
    HeroContent.findOne().lean(),
    Introduction.findOne().lean(),
    Experience.find().sort({ order: 1, createdAt: -1 }).lean(),
    Education.find().sort({ order: 1, createdAt: -1 }).lean(),
    Project.find().sort({ order: 1, createdAt: -1 }).lean(),
    Research.find().sort({ order: 1, createdAt: -1 }).lean(),
    Certificate.find().sort({ order: 1, createdAt: -1 }).lean(),
    Skill.find().sort({ order: 1, createdAt: -1 }).lean(),
    Hobby.find().sort({ order: 1, createdAt: -1 }).lean(),
  ]);

  const settings = serializeAISettings(settingsDoc);
  const knowledgeBase = buildKnowledgeBase({
    settings,
    hero,
    introduction,
    experience,
    education,
    projects,
    research,
    certificates,
    skills,
    hobbies,
  });

  return { settings, knowledgeBase };
};

const getAISettings = async (req, res) => {
  const item = await AISettings.findOne().lean();
  res.json(serializeAISettings(item));
};

const updateAISettings = async (req, res) => {
  const payload = {
    assistantName: normalizeString(req.body.assistantName, 80) || DEFAULT_AI_SETTINGS.assistantName,
    assistantSubtitle:
      normalizeString(req.body.assistantSubtitle, 160) || DEFAULT_AI_SETTINGS.assistantSubtitle,
    primaryGoal: normalizeString(req.body.primaryGoal, 500),
    currentRole: normalizeString(req.body.currentRole, 200),
    location: normalizeString(req.body.location, 200),
    opportunityFocus: normalizeString(req.body.opportunityFocus, 300),
    contactEmail: normalizeString(req.body.contactEmail, 160),
    portfolioUrl: normalizeString(req.body.portfolioUrl, 2048),
    linkedinUrl: normalizeString(req.body.linkedinUrl, 2048),
    githubUrl: normalizeString(req.body.githubUrl, 2048),
    kaggleUrl: normalizeString(req.body.kaggleUrl, 2048),
    facebookUrl: normalizeString(req.body.facebookUrl, 2048),
    responseStyle: normalizeString(req.body.responseStyle, 2000),
    knowledgeBase: normalizeString(req.body.knowledgeBase, 20000),
    responseRules:
      normalizeString(req.body.responseRules, 4000) || DEFAULT_AI_SETTINGS.responseRules,
    additionalKnowledge: normalizeString(req.body.additionalKnowledge, 12000),
    fallbackReply:
      normalizeString(req.body.fallbackReply, 500) || DEFAULT_AI_SETTINGS.fallbackReply,
  };

  const urlFields = [
    'portfolioUrl',
    'linkedinUrl',
    'githubUrl',
    'kaggleUrl',
    'facebookUrl',
  ];

  const invalidUrlField = urlFields.find((field) => !isValidUrl(payload[field]));
  if (invalidUrlField) {
    return res.status(400).json({ message: `Invalid URL in ${invalidUrlField}` });
  }

  const updated = await AISettings.findOneAndUpdate(
    {},
    payload,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return res.json(serializeAISettings(updated.toObject()));
};

const chatWithAI = async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const history = sanitizeHistory(req.body?.history);

  if (!prompt) {
    return res.status(400).json({ reply: 'Please ask a question first.' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res
      .status(400)
      .json({ reply: `Please keep your question shorter (max ${MAX_PROMPT_LENGTH} characters).` });
  }

  if (!genAI) {
    return res.status(503).json({ reply: 'AI assistant is currently unavailable.' });
  }

  const { settings, knowledgeBase } = await fetchKnowledgeContext();

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 550,
      },
    });

    const fullPrompt = `${knowledgeBase}\n\nCONVERSATION CONTEXT\n${formatHistory(history)}\n\nUSER QUESTION\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = (response.text() || '').trim();

    return res.json({ reply: text || 'I do not have enough context for that yet.' });
  } catch (error) {
    console.error('AI Error:', error.message);
    return res
      .status(500)
      .json({ reply: settings.fallbackReply || DEFAULT_AI_SETTINGS.fallbackReply });
  }
};

module.exports = { chatWithAI, getAISettings, updateAISettings };
