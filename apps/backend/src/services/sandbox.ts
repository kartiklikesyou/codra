import { Sandbox } from "e2b";
export const WEBSITE_DIR = "/home/user/project";

type File = {
  path : string ,
  content : string 
}

function haveDependenciesChanged(oldContent?:string, newContent?:string):boolean {
  if(!oldContent || !newContent) return false 

  try{
    const oldPkg = JSON.parse(oldContent)
    const newPkg = JSON.parse(newContent) 
    const oldDeps = JSON.stringify({ ...oldPkg.dependencies, ...oldPkg.devDependencies });
    const newDeps = JSON.stringify({ ...newPkg.dependencies, ...newPkg.devDependencies });
    return oldDeps !== newDeps;
  }catch{
    return false
  }
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
    `cd ${WEBSITE_DIR} && export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=".e2b.app" && while true; do npm run dev -- --host 0.0.0.0 --port 5173 --strictPort; sleep 1; done`,
    { background: true }
  );
    
  const host = sandbox.getHost(5173);

  console.log("Preview host:", host);

  return {
    url: `https://${host}`,
    sandbox,
  };
}

export async function updateWebsite(sandbox: Sandbox, newFiles: File[], oldFiles: File[] = []) {
    await Promise.all(
    newFiles.map((file) => {
      if ((file.path.endsWith("App.jsx") || file.path.endsWith("App.tsx")) && !file.content.includes("export default")) {
        file.content += "\nexport default App;\n";
      }
      return sandbox.files.write(`${WEBSITE_DIR}/${file.path}`, file.content);
    })
  );

  const oldPkg = oldFiles.find((f) => f.path === "package.json")?.content;
  const newPkg = newFiles.find((f) => f.path === "package.json")?.content;

  if (haveDependenciesChanged(oldPkg, newPkg)) {
    await sandbox.commands.run(
      `cd ${WEBSITE_DIR} && npm install --no-audit --no-fund --prefer-offline`,
      { timeoutMs: 120000 }
    );
  }

  const checkPort = await sandbox.commands.run(
    `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || true`
  );
  if (!checkPort.stdout || checkPort.stdout.trim() === "000") {
    await sandbox.commands.run(
      `cd ${WEBSITE_DIR} && export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=".e2b.app" && while true; do npm run dev -- --host 0.0.0.0 --port 5173 --strictPort; sleep 1; done`,
      { background: true }
    );
  }
}
