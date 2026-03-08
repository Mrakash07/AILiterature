const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    // Instead of instantiating GoogleGenerativeAI to list models, let's just use fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(data.models.map(m => m.name).join('\n'));
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

test();
