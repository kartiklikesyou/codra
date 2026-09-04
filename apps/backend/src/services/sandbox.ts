import { Sandbox } from "e2b";

type File = {
  path : string ,
  content : string 
}

export async function createWebsite(files : File[]) {
  const sandbox = await Sandbox.create();
  for (const file of files){
    await sandbox.files.write(`/tmp/${file.path}`,file.content);
  }
  await sandbox.commands.run(
    "python3 -m http.server 3000 --directory /tmp",
    {
      background: true,
    }
  );

  const host = sandbox.getHost(3000);

  return {
    url: `https://${host}`,
    sandbox,
  };
}