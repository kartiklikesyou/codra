import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { groq } from "@ai-sdk/groq";

const websiteSchema = z.object({
  message: z.string(),

  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

async function generateWithFallback(prompt: string) {
  try {
    const result = await generateText({
      model: groq("openai/gpt-oss-20b"),
      output: Output.object({
        schema: websiteSchema,
      }),
      prompt,
    });

    console.log("Groq succeeded");
    return result.output;

  } catch (groqError) {
    console.error("Groq failed. Falling back to Gemini...");
    console.error(groqError);

    const result = await generateText({
      model: google("gemini-3.6-flash"),
      output: Output.object({
        schema: websiteSchema,
      }),
      prompt,
    });

    console.log("Gemini succeeded");
    return result.output;
  }
}

export async function generateWebsite(prompt: string) {
  const result = await generateWithFallback(`
You are an expert website generator.

The user wants:

${prompt}

Generate a complete, working website.

Return:
- A short message explaining what you created
- All website files with their paths and complete contents

Important:
- Generate a complete working website.
- Use HTML, CSS, and JavaScript.
- Make sure index.html is the main entry file.
- Include all necessary files.
- Do not leave placeholder code.
`);

  return result;
}

type WebsiteFile={
  path : string,
  content:string
}

export async function modifyWebsite(files:WebsiteFile[],instruction:string){
   const result = await generateWithFallback(`
You are an AI website editor.

The user has an existing website with these files:

${files
  .map(
    (file) => `
FILE: ${file.path}

${file.content}
`
  )
  .join("\n\n")}

The user wants this modification:

${instruction}

Modify the existing website according to the user's request.

Important rules:
- Preserve existing functionality unless the user asks to change it.
- Return the COMPLETE contents of every file.
- Do not return explanations inside the file contents.
- Keep the same file paths unless new files are necessary.

Return:
- A short message explaining what you changed.
- The complete updated website files.
`);

  return result;
}