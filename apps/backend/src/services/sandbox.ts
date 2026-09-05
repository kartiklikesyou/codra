import { Sandbox } from "e2b";
const WEBSITE_DIR = "/tmp/website";

type File = {
  path : string ,
  content : string 
}

export async function createWebsite(files: File[]) {
  const sandbox = await Sandbox.create({
    timeoutMs: 60 * 60 * 1000,
  });

  await sandbox.commands.run(
    `mkdir -p ${WEBSITE_DIR}`
  );

  for (const file of files) {
    await sandbox.files.write(
      `${WEBSITE_DIR}/${file.path}`,
      file.content
    );
  }

  await sandbox.commands.run(
    `nohup python3 -m http.server 3000 --directory ${WEBSITE_DIR} > /tmp/server.log 2>&1 &`
  );

  const host = sandbox.getHost(3000);

  return {
    url: `https://${host}`,
    sandbox,
  };
}