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
      prompt
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
You are an expert frontend engineer, UI/UX designer, and creative web designer.

Build a polished, production-quality website based on the user's request below.

USER'S WEBSITE REQUEST:
${prompt}

Your job is to understand the user's request and turn it into a complete, visually impressive, functional website.

==================================================
RUNTIME REQUIREMENTS — MUST FOLLOW
==================================================

- The website must be a static website.
- Use ONLY HTML, CSS, and vanilla JavaScript.
- Do NOT use React.
- Do NOT use JSX.
- Do NOT use TypeScript.
- Do NOT use Next.js.
- Do NOT use Vite.
- Do NOT use npm or Node.js.
- Do NOT create package.json.
- Do NOT require any build step or compilation.
- The website must work directly through a simple Python HTTP server.

The website MUST consist of:

- index.html
- style.css
- script.js

Use relative paths between these files.

Do not reference files that you did not create.

==================================================
FILE CREATION
==================================================

You MUST use the writeFiles tool.

Create the complete website by writing:

1. index.html
2. style.css
3. script.js

Whenever possible, create all required files in ONE writeFiles call.

Do not merely describe the website.
Actually create the files using writeFiles.

==================================================
DESIGN — DO NOT MAKE A BASIC WEBSITE
==================================================

The website should feel like a professionally designed modern website rather than a generic AI template.

Prioritize:

- Strong visual hierarchy
- Distinctive layouts
- Professional typography
- Excellent spacing
- Consistent visual language
- Intentional color palette
- Beautiful cards and components where appropriate
- Depth and visual layering
- Subtle gradients where appropriate
- Borders, shadows, textures, or other tasteful details
- Clear primary and secondary actions
- High-quality responsive layouts
- Smooth transitions
- Micro-interactions
- Hover states
- Focus states
- Subtle animations

Avoid repeatedly using the same generic pattern:

Hero → 3 cards → CTA → footer.

Instead, design the layout specifically around the user's request.

The website should look intentionally designed.

==================================================
CONTENT
==================================================

Use the user's request as the primary source of truth.

If the user provides specific:

- Name
- Company
- Brand
- Product
- Role
- Projects
- Skills
- Colors
- Text
- Sections
- Features

use those details.

If important information is missing, intelligently create realistic content that fits the website.

Do NOT use:

- Lorem ipsum
- "Your Name"
- "Project 1"
- "Company Name"
- Generic placeholder copy

unless the user explicitly asks for placeholders.

Content should feel believable and relevant to the website.

==================================================
STRUCTURE
==================================================

Choose sections based on the user's request.

For example, a developer portfolio could include:

- Navigation
- Hero
- About
- Skills
- Tech stack
- Featured projects
- Experience
- Achievements
- Testimonials
- Contact
- Footer

But DO NOT blindly include every possible section.

Only include sections that improve the specific website.

==================================================
INTERACTIVITY
==================================================

Add meaningful vanilla JavaScript interactions when appropriate.

Possible interactions include:

- Mobile navigation
- Smooth scrolling
- Active navigation states
- Tabs
- Accordions
- Modals
- Form validation
- Toast notifications
- Theme switching
- Filtering
- Search
- Interactive project cards
- Scroll-based reveal animations
- Button interactions

Only add interactions that make sense.

Do not add JavaScript simply to make the project appear more complex.

==================================================
RESPONSIVENESS
==================================================

The website MUST work properly on:

- 1440px+
- 1024px
- 768px
- 480px
- 375px

Ensure:

- No horizontal scrolling
- No overflowing text
- No broken layouts
- Navigation works on mobile
- Buttons remain accessible
- Cards resize properly
- Images scale correctly
- Typography remains readable

Use CSS media queries and responsive layout techniques.

==================================================
ACCESSIBILITY
==================================================

Use basic accessibility best practices:

- Semantic HTML
- Correct heading hierarchy
- Labels for form inputs
- Meaningful alt text
- Keyboard-accessible interactions
- Visible focus states
- Good color contrast
- Buttons for actions
- Links for navigation

==================================================
IMAGES AND ICONS
==================================================

If images improve the website, use reliable remote image URLs that can be loaded directly by the browser.

Do not create references to local image files unless you actually create those files.

If images are unnecessary, use:

- CSS gradients
- Shapes
- Typography
- Borders
- Icons
- Decorative elements

instead.

Do not let missing external images break the layout.

==================================================
CODE QUALITY
==================================================

Write clean, maintainable code.

HTML:
- Use semantic elements.
- Keep structure organized.
- Avoid unnecessary nesting.

CSS:
- Use CSS variables for the design system.
- Keep styles organized.
- Avoid excessive duplication.
- Use responsive rules cleanly.

JavaScript:
- Use modern vanilla JavaScript.
- Avoid unnecessary global variables.
- Handle missing DOM elements safely.
- Keep interactions modular and understandable.

==================================================
ERROR PREVENTION
==================================================

Before finishing, mentally verify the entire website.

Check that:

- index.html correctly loads style.css.
- index.html correctly loads script.js.
- All referenced files exist.
- JavaScript contains no syntax errors.
- CSS contains no invalid syntax.
- Every event listener targets an existing element.
- Every JavaScript function that is called actually exists.
- Navigation links point to valid sections or destinations.
- No framework-specific code exists.
- No npm dependencies are required.
- No build process is required.
- The website works directly through a Python HTTP server.
- The website remains responsive.
- Existing functionality is not applicable because this is a new website.

==================================================
QUALITY BAR
==================================================

Do NOT optimize for the smallest amount of code.

Optimize for:

1. Visual quality
2. User experience
3. Distinctive design
4. Responsiveness
5. Meaningful interactivity
6. Accessibility
7. Clean architecture
8. Reliability

The final website should feel like something a professional frontend developer would actually ship.

It should NOT feel like a basic AI-generated demo.

==================================================
FINAL INSTRUCTION
==================================================

Understand the user's request:

${prompt}

Then use the writeFiles tool to create the complete website.

Do not return the file contents in your final response.

After successfully creating the website, respond with a short confirmation.
`,files);

  return result;
}

export async function modifyWebsite(files:WebsiteFile[],instruction:string){
   const result = await generateWithFallback(`
    You are an expert AI website editor and frontend engineer.

The user has an existing website.

The user wants this modification:

${instruction}

FIRST:
Use the readFiles tool to inspect the files relevant to the requested modification.

THEN:
Use the writeFiles tool to apply the requested changes.

IMPORTANT RUNTIME RULES:
- This is a static website using ONLY HTML, CSS, and vanilla JavaScript.
- Do NOT introduce React, JSX, TypeScript, Next.js, Vite, npm, Node.js, or frameworks.
- Do NOT create package.json or dependency files.
- Keep the website compatible with a simple Python HTTP server.
- Use the existing file structure and paths.
- Do not introduce unnecessary new files.

MODIFICATION RULES:
- Make ONLY the changes requested by the user.
- Modify only the files that actually need changes.
- Preserve all existing functionality unless the user explicitly asks to change it.
- Preserve the existing visual design, typography, spacing, colors, layout, and design system unless the requested change requires modifying them.
- Do not unnecessarily rewrite entire files.
- Keep existing content and functionality that is unrelated to the request.
- Keep the same file paths unless a new file is genuinely necessary.
- If the requested change requires HTML, CSS, and JavaScript changes, update all relevant files so they remain consistent.

QUALITY:
- Keep the website responsive.
- Preserve mobile and desktop behavior.
- Preserve accessibility.
- Preserve existing animations and interactions unless the user asks to change them.
- Follow the existing coding style where practical.
- Avoid introducing duplicate CSS rules or unnecessary JavaScript.
- Do not break existing navigation, buttons, forms, or interactions.

ERROR PREVENTION:
Before finishing, verify that:
- All referenced files exist.
- HTML references the correct CSS and JS files.
- JavaScript references valid DOM elements.
- No syntax errors are introduced.
- No existing functionality unrelated to the request is broken.
- The website still works as a static HTML/CSS/JS website.

After applying the changes, respond with a short confirmation.`,files);

  return result;
}


