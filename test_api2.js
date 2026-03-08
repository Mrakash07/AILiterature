const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY not found');
        return;
    }

    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const papers = [
        { title: "Attention Is All You Need", abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely." },
        { title: "Generative Pre-trained Transformer", abstract: "Natural language understanding comprises a wide range of diverse tasks such as textual entailment, question answering, semantic similarity assessment, and document classification. Although large unlabeled text corpora are abundant, labeled data for these specific tasks is scarce, making it challenging for discriminatively trained models to perform adequately." }
    ];

    const metadata = papers.map(p => `- **${p.title}**: ${p.abstract}`).join('\n\n');
    const prompt = `You are an academic researcher. Write a comprehensive literature review that synthesizes the following research papers.\n\nPAPERS:\n${metadata}`;

    console.log(`--- Testing Literature Review via FETCH: ${modelName} ---`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            console.log('SUCCESS Result Length:', data.candidates[0].content.parts[0].text.length);
            console.log('Result Snippet:', data.candidates[0].content.parts[0].text.substring(0, 200));
        } else {
            console.error('FAILED:', JSON.stringify(data));
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

test();
