import { Sandbox } from "e2b";
const WEBSITE_DIR = "/tmp/website";

type File = {
  path : string ,
  content : string 
}

console.log("Creating E2B Sandbox")
export async function createWebsite(files: File[]) {
  console.log("Creating E2B sandbox...");

  const sandbox = await Sandbox.create({
    timeoutMs: 60 * 60 * 1000,
  });

  console.log("E2B sandbox created");

  console.log("Creating website directory...");
  await sandbox.commands.run(`mkdir -p ${WEBSITE_DIR}`);
  console.log("Website directory created");

  for (const file of files) {
    console.log(`Writing file: ${file.path}`);

    await sandbox.files.write(
      `${WEBSITE_DIR}/${file.path}`,
      file.content
    );

    console.log(`Wrote file: ${file.path}`);
  }

  console.log("Starting HTTP server...");

  await sandbox.commands.run(
    `nohup python3 -m http.server 3000 --directory ${WEBSITE_DIR} > /tmp/server.log 2>&1 &`
  );

  console.log("HTTP server started");

  const host = sandbox.getHost(3000);

  console.log("Preview host:", host);

  return {
    url: `https://${host}`,
    sandbox,
  };
}