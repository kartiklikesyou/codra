import { prismaClient } from "db";
import { getServerSession } from "next-auth";

export default async function Home() {
  const users = await prismaClient.user.findMany();
  const session = await getServerSession()
  return (
    <div>
      {JSON.stringify(users)}
      {JSON.stringify(session)}
    </div>
  );
}


