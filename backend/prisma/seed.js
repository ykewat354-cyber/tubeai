const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo user
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@tubeai.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@tubeai.com",
      password: hashedPassword,
      plan: "free",
    },
  });

  console.log("✅ Created demo user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
