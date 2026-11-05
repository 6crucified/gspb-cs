import { PrismaClient, SignupPolicy } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: 1 },
    create: { id: 1, signupPolicy: SignupPolicy.invite_only },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
