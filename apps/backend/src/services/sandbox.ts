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

  for (const file of files) {
    await sandbox.files.write(
      `${WEBSITE_DIR}/${file.path}`,
      file.content
    );
  }

  await sandbox.commands.run(
    `cd ${WEBSITE_DIR} && npm install`,
    {
      timeoutMs: 120000
    }
  );

  await sandbox.commands.run(
    `cd ${WEBSITE_DIR} && export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=".e2b.app" && npm run dev -- --host 0.0.0.0`,
    { background: true }
  );

  await new Promise ((resolve)=>{setTimeout(resolve,3000)})

  const host = sandbox.getHost(5173);

  console.log("Preview host:", host);

  return {
    url: `https://${host}`,
    sandbox,
  };
}