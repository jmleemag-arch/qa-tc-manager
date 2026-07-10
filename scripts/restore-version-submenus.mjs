import { PrismaClient } from "@prisma/client";
import { SIDEBAR_MENUS } from "../src/features/testcases/constants/testCaseConstants.js";

const prisma = new PrismaClient();
const FIXED_SUBMENUS = ["Total", "대시보드"];

async function restoreVersionSubmenus(versionName) {
  const version = await prisma.version.findUnique({
    where: { versionName },
    include: { submenus: true },
  });

  if (!version) {
    throw new Error(`Version '${versionName}' not found.`);
  }

  const optionalMenus = SIDEBAR_MENUS.filter(
    (menu) => !FIXED_SUBMENUS.includes(menu)
  );
  const normalizedMenus = [...FIXED_SUBMENUS, ...optionalMenus];

  await prisma.$transaction(async (tx) => {
    await tx.submenu.deleteMany({
      where: { versionId: version.id },
    });

    await tx.submenu.createMany({
      data: normalizedMenus.map((name, index) => ({
        versionId: version.id,
        name,
        isDefault: FIXED_SUBMENUS.includes(name),
        sortOrder: index,
        isActive: true,
      })),
    });
  });

  console.log(
    JSON.stringify(
      {
        versionName,
        restoredMenus: normalizedMenus,
      },
      null,
      2
    )
  );
}

const versionName = process.argv[2] ?? "26.1.0";

restoreVersionSubmenus(versionName)
  .catch((error) => {
    console.error("Restore submenus failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
