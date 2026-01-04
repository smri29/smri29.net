const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
        You are "Orbit", the AI Assistant for Shah Mohammad Rizvi (Rizvi). 
        Your goal is to help visitors learn about Rizvi's professional background.
        
        KNOWLEDGE BASE:
        - Education: BSc in CSE from IUBAT (CGPA 3.82, Batch of 2026), HSC (GPA 5.00), SSC (GPA 5.00).
        - Roles: Founder & President of CollabCircle (ML/DL Research Org).
        - Research: 7 papers including Tomato Leaf Disease, Parkinson's Detection, and Bengali Digit Recognition.
        - Tech Stack: MERN (React, Node, Express, MongoDB), Python, ML/DL, Flutter.
        - Achievements: ICPC Regional 2024, Solvio AI Hackathon 2025.
        - Personality: Professional, helpful, and concise. 
        - If someone asks something personal or unrelated to his career, politely redirect them to his work.
        - Use emojis occasionally to stay friendly.
      `,
    });

    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 200 },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "I'm having trouble thinking right now. Please try again later!" });
  }
};

module.exports = { chatWithAI };