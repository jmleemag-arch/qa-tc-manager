import { prisma } from "../server/db.js";

async function normalizeTestRunResults() {
  const legacyUnset = await prisma.testRunItem.updateMany({
    where: {
      result: { in: ["NT", ""] },
    },
    data: {
      result: null,
      executedAt: null,
    },
  });

  const legacyBlock = await prisma.testRunItem.updateMany({
    where: {
      result: "BLOCK",
    },
    data: {
      result: "N/A",
    },
  });

  const clearedExecutedAt = await prisma.testRunItem.updateMany({
    where: {
      result: null,
      executedAt: { not: null },
    },
    data: {
      executedAt: null,
    },
  });

  console.log(
    `Normalized test run results: unset=${legacyUnset.count}, blockToNa=${legacyBlock.count}, clearedExecutedAt=${clearedExecutedAt.count}`
  );
}

normalizeTestRunResults()
  .catch((error) => {
    console.error("Failed to normalize test run results:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
