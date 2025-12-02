import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { syllabus, covered } = await req.json();
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


    const prompt = `
      Act as an academic analyst. Compare the SYLLABUS with TOPICS COVERED.
      1. Identify missing topics.
      2. Estimate the percentage of the syllabus completed (0-100).
      3. Prioritize missing topics (High/Medium/Low).

      Return STRICT JSON format:
      {
        "percentage_covered": number,
        "gaps": [
          { "topic": "string", "priority": "High" | "Medium" | "Low", "reason": "string" }
        ]
      }

      SYLLABUS: ${syllabus}
      TOPICS COVERED: ${covered}
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());

    return NextResponse.json(json);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Analysis failed: ' + (error as Error).message }, { status: 500 });
  }
}
