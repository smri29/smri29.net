const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ No API Key found in .env file");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("🔍 Checking available Gemini models...");

fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
        console.error("❌ API Error:", data.error.message);
        return;
    }

    console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
    if (data.models) {
      data.models.forEach(m => {
        // We only care about models that support 'generateContent' (Chat)
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`--------------------------------`);
            console.log(`Name: ${m.name}`); // This is what we need to put in aiController.js
            console.log(`DisplayName: ${m.displayName}`);
        }
      });
      console.log(`\n--------------------------------`);
    } else {
        console.log("No models found.");
    }
  })
  .catch(error => console.error("Network Error:", error));