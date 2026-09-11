import { generateText, Output, tool, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import {openai} from "@ai-sdk/openai"

const websiteSchema = z.object({
  message: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

type WebsiteFile={
  path : string,
  content:string
}

function createWriteFileTool(files : WebsiteFile[]){
  return tool({
    description : "Create or update multiple website files at once",
    inputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
    execute : async (input)=>{
      const newFiles = input.files
      console.log("TOOL CALLED: writeFiles",newFiles.map((file) => file.path));

      for (const newFile  of  newFiles){
        const existingFile = files.find((file)=>file.path===newFile.path)
        if (existingFile){  
          existingFile.content = newFile.content
        }
        if(!existingFile){
            files.push(newFile)
        }
      }
      return {
        success:true,
        files:newFiles.map((file)=>file.path)
      }
    } 
  })
}

function createReadFileTools(files : WebsiteFile[]){
  return tool({
    description : "Read one or more existing website files",
    inputSchema : z.object({
      paths : z.array(z.string())
    }),
    execute : async function (input){
      const paths = input.paths
      console.log("TOOL CALLED : readFiles",paths)
      return paths.map((path)=>{
        const file = files.find((file)=>file.path===path)
        return {
          path,
          content : file?.content ?? null,
          exists : !!file
        }
      })
    }
  })
}

function cloneFiles(files: WebsiteFile[]): WebsiteFile[] {
  return files.map((file) => ({
    path: file.path,
    content: file.content,
  }));
}

async function generateWithFallback(
  prompt: string,
  files: WebsiteFile[]
) {
  const start = Date.now();

  try {
    console.log("Trying OpenAI...");

    const openAIFiles = cloneFiles(files);

    const tools: Record<string, any> = {
      writeFiles: createWriteFileTool(openAIFiles),
    };

    if (openAIFiles.length > 0) {
      tools.readFiles = createReadFileTools(openAIFiles);
    }

    const result = await generateText({
      model: openai("gpt-5.6-luna"),
      tools,
      stopWhen: stepCountIs(4),
      prompt,
    });

    console.log("OpenAI succeeded");
    console.log(`Whole Generation took ${Date.now() - start}ms`);

    files.length = 0;
    files.push(...openAIFiles);

    return {
      message: result.text,
      files,
    };

  } catch (openAIError) {

    console.error("OpenAI failed, falling back to Gemini");
    console.error(openAIError);

    const geminiFiles = cloneFiles(files);

    const tools: Record<string, any> = {
      writeFiles: createWriteFileTool(geminiFiles),
    };

    if (geminiFiles.length > 0) {
      tools.readFiles = createReadFileTools(geminiFiles);
    }

    const result = await generateText({
      model: google("gemini-3.6-flash"),
      tools,
      stopWhen: stepCountIs(4),
      prompt,
    });

    console.log("Gemini succeeded");
    console.log(`Whole Generation took ${Date.now() - start}ms`);

    files.length = 0;
    files.push(...geminiFiles);

    return {
      message: result.text,
      files,
    };
  }
}
 
export async function generateWebsite(prompt: string) {
  const files: WebsiteFile[] = [];
  const result = await generateWithFallback(`
You are an expert website generator.

The user wants:

${prompt}

Generate a complete, working website based on the user's request.

IMPORTANT:
- You MUST use the writeFiles tool.
- Create ALL required files in ONE single tool call.
- Do NOT make separate tool calls for individual files.
- Do NOT return file contents in your final response.

For a standard website, create:
- index.html
- style.css
- script.js

Requirements:
- index.html is the main entry point.
- style.css contains the website styling.
- script.js contains the website functionality.
- Make the website responsive and polished.
- Include all functionality requested by the user.
- Do not leave TODOs, placeholders, or incomplete code.
- Make sure file references are correct.

After calling writeFiles, respond with only a short confirmation.
`,files);

  return result;
}

export async function modifyWebsite(files:WebsiteFile[],instruction:string){
   const result = await generateWithFallback(`
    You are an AI website editor.

    The user has an existing website.

    The user wants this modification:

    ${instruction}

    Use the readFiles tool to inspect the files you need before modifying them.

    Then use the writeFiles tool to apply the changes.

    Important rules:
    - Only read files that are relevant to the requested modification.
    - Preserve existing functionality unless the user asks to change it.
    - Modify only the files that actually need changes.
    - Keep the same file paths unless a new file is necessary.
    - Do not return file contents in your final response.
    - After modifying the files, respond with a short confirmation.`,files);

  return result;
}


