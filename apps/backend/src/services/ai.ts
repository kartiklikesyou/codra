import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function generateWebsite(prompt: string) {
  const { output } = await generateText({
    model: google("gemini-3.6-flash"),

    output: Output.object({
      schema: z.object({
        message: z.string(),

        files: z.array(
          z.object({
            path: z.string(),
            content: z.string(),
          })
        ),
      }),
    }),

    prompt: `
You are a website generator.

The user wants: ${prompt}

Generate a simple website.

Return:
- A short message explaining what you created
- The website files with their paths and complete contents
`,
  });

  return output;
}