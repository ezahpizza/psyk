import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

// Mental health focused helper generation functions (can be used for UI side-features)

export async function generateMoodReflection({ text }: { text: string }) {
  const { object } = await generateObject({
    model: geminiFlashModel,
    prompt: `Given the journal style text below, identify the primary emotions (2-4 words), an empathetic reflection (1-2 sentences), and a regulating breathing suggestion if user sounds tense. Text: ${text}`,
    schema: z.object({
      emotions: z.array(z.string()).describe("2-4 short emotion words"),
      reflection: z.string().describe("Empathetic validating reflection"),
      breathingTip: z.string().optional().describe("Optional short breathing exercise (<=1 sentence)"),
    }),
  });
  return object;
}

export async function generateCopingIdeas({ concern }: { concern: string }) {
  const { object } = await generateObject({
    model: geminiFlashModel,
    prompt: `Provide 3 concise, evidence-informed but non-clinical coping ideas for: ${concern}. Avoid medical advice; be gentle and practical.`,
    schema: z.object({
      ideas: z.array(z.string().max(160)).length(3),
      disclaimer: z.string().describe("Short reminder this isn't professional advice"),
    }),
  });
  return object;
}

export async function psychoeducationSummary({ topic }: { topic: string }) {
  const { object } = await generateObject({
    model: geminiFlashModel,
    prompt: `Explain the mental health topic '${topic}' in plain, stigma-free language (60-90 words). Include what it is, a common misconception, and a gentle encouragement to seek help if impacting daily life.`,
    schema: z.object({ summary: z.string() }),
  });
  return object.summary;
}
