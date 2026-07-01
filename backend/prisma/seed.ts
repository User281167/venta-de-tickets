import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/shared/database/prisma.client.js';

const SUPABASE_URL = process.env['SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const id = process.env['SUPER_ADMIN_ID'];
  const email = process.env['SUPER_ADMIN_EMAIL'];

  if (!id || !email) {
    console.error('Missing SUPER_ADMIN_ID or SUPER_ADMIN_EMAIL in .env');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { id } });

  // Sincronizar siempre app_metadata: las semillas anteriores pueden haber configurado public.users.role
  await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: { role: 'super_admin' },
  });

  if (existing && existing.role) {
    console.log(
      `Super admin already exists: ${existing.email} (role: ${existing.role})`,
    );
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { role: 'super_admin' },
  });

  console.log(`Super admin created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
