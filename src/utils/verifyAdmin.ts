import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../services';

// ─── Verify Admin Role ─────────────────────────────────────────────
export const verifyAdmin = async (userId: string, prisma: PrismaService) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.role.name !== 'Admin') {
    throw new ForbiddenException(
      'Only users with Admin role can perform this action.',
    );
  }

  return user;
};
