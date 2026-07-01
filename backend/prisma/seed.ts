import 'dotenv/config';
import { prisma } from '../src/shared/database/prisma.client.js';

async function main() {
  const id = process.env['SUPER_ADMIN_ID'];
  const email = process.env['SUPER_ADMIN_EMAIL'];

  if (!id || !email) {
    console.error('Missing SUPER_ADMIN_ID or SUPER_ADMIN_EMAIL in .env');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { id } });

  if (existing) {
    console.log(`Super admin already exists: ${existing.email}`);
    return;
  }

  await prisma.admin.create({
    data: {
      id,
      email,
      fullName: 'Super Admin',
      role: 'super_admin',
    },
  });

  console.log(`Super admin created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
