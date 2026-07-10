import { prisma } from "../server/db.js";
import { DEMO_USERS } from "../src/features/auth/constants/authConstants.js";

const DEFAULT_PASSWORD = "test1234";

async function resetPasswords() {
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        password: DEFAULT_PASSWORD,
        name: user.name,
        role: user.id === "tester1" ? "admin" : "tester",
        status: "active",
      },
      update: {
        password: DEFAULT_PASSWORD,
        status: "active",
      },
    });
  }

  console.log(`Reset passwords to ${DEFAULT_PASSWORD} for ${DEMO_USERS.length} users.`);
}

resetPasswords()
  .catch((error) => {
    console.error("Password reset failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
