const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  const { prompt } = req.body;

  try {
    // 1. We use "gemini-2.5-flash" because we confirmed it exists in your list.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: [],
    });

    // 2. UNIVERSAL METHOD: Inject personality directly into the user message.
    // This works on every model version without failing.
    const fullPrompt = `
      SYSTEM INSTRUCTION:
      You are the "Portfolio Assistant" for Shah Mohammad Rizvi. 
      Your specific goal is to represent Rizvi to recruiters and researchers visiting his website.
      
      KNOWLEDGE BASE:
      - Education: BSc in CSE from IUBAT (CGPA 3.82, Batch of 2026).
      - Core Expertise: Machine Learning, Deep Learning, Computer Vision, Full Stack Dev.
      - Leadership: Founder & President of CollabCircle (Note: Do not refer to yourself as Orbit).
      - Research: 7+ publications including 'Tomato Leaf Disease Detection' and 'Parkinson's Detection'.
      - Tech Stack: MERN (React, Node, Mongo), Python, PyTorch, Flutter.
      - Achievements: ICPC Regional 2024, Solvio AI Hackathon 2025.
      
      BEHAVIOR:
      - Professional, concise, and polite.
      - Answer exclusively about Rizvi's professional life.
      - If asked "Who are you?", say: "I am Rizvi's AI Portfolio Assistant, here to answer questions about his research and skills."
      
      USER QUESTION: ${prompt}
    `;

    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    res.json({ reply: response.text() });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "I'm currently updating my servers. Please check Rizvi's resume for that info!" });
  }
};

module.exports = { chatWithAI };