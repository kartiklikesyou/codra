import { Sandbox } from "e2b";
export const WEBSITE_DIR = "/home/user/project";

type File = {
  path : string ,
  content : string 
}

export async function createWebsite(files: File[]) {
  const sandbox = await Sandbox.create({
    timeoutMs: 60 * 60 * 1000,
  });

  await sandbox.commands.run(`mkdir -p ${WEBSITE_DIR}`);

    await Promise.all(
    files.map((file) => {
      if ((file.path.endsWith("App.jsx") || file.path.endsWith("App.tsx")) && !file.content.includes("export default")) {
        file.content += "\nexport default App;\n";
      }
      return sandbox.files.write(`${WEBSITE_DIR}/${file.path}`, file.content);
    })
  ); 

  await sandbox.commands.run(
    `cd ${WEBSITE_DIR} && npm install --no-audit --no-fund --prefer-offline`,
    {
      timeoutMs: 120000
    }
  );

    await sandbox.commands.run(
    `cd ${WEBSITE_DIR} && export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=".e2b.app" && while true; do npm run dev -- --host 0.0.0.0; sleep 1; done`,
    { background: true }
  );
    
  const host = sandbox.getHost(5173);

  console.log("Preview host:", host);

  return {
    url: `https://${host}`,
    sandbox,
  };
}

export async function updateWebsite(sandbox: Sandbox, files: File[]) {
  // 1. Write all modified files in parallel
    await Promise.all(
    files.map((file) => {
      if ((file.path.endsWith("App.jsx") || file.path.endsWith("App.tsx")) && !file.content.includes("export default")) {
        file.content += "\nexport default App;\n";
      }
      return sandbox.files.write(`${WEBSITE_DIR}/${file.path}`, file.content);
    })
  );

  // 2. If package.json was updated, install new dependencies
  const hasPackageJson = files.some((f) => f.path === "package.json");
  if (hasPackageJson) {
    await sandbox.commands.run(
      `cd ${WEBSITE_DIR} && npm install --no-audit --no-fund --prefer-offline`,
      { timeoutMs: 120000 }
    );
  }

  // 3. Ensure Vite dev server is still running on port 5173
  const checkPort = await sandbox.commands.run(
    `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || true`
  );
  if (!checkPort.stdout || checkPort.stdout.trim() === "000") {
    await sandbox.commands.run(
      `cd ${WEBSITE_DIR} && export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=".e2b.app" && while true; do npm run dev -- --host 0.0.0.0; sleep 1; done`,
      { background: true }
    );
  }
}
