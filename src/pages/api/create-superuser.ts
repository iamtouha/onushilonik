import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

const createSuperUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (user) {
    return res.status(401).json({
      message: "Admin user already assigned.",
      email: user.email,
    });
  }
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (!firstUser) {
    return res.status(401).json({
      message: "Please log in first.",
    });
  }
  await prisma.user.update({
    where: { id: firstUser.id },
    data: { role: "SUPER_ADMIN" },
  });

  return res.status(200).json({
    message: "Admin user created.",
    email: firstUser.email,
  });
};

export default createSuperUser;
