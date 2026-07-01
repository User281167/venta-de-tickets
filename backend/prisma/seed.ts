import 'dotenv/config';
import { prisma } from '../src/shared/database/prisma.client.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
);

async function main() {
  const id = process.env['SUPER_ADMIN_ID'];
  const email = process.env['SUPER_ADMIN_EMAIL'];

  if (!id || !email) {
    console.error('Missing SUPER_ADMIN_ID or SUPER_ADMIN_EMAIL in .env');
    process.exit(1);
  }

  // Verificar que existe en auth.users (creado via Supabase dashboard)
  const { data: authUser, error } =
    await supabaseAdmin.auth.admin.getUserById(id);
  if (error || !authUser) {
    console.error(
      'User not found in Supabase Auth — create it in the dashboard first',
    );
    process.exit(1);
  }

  // Idempotencia ya es super_admin en ambos lados
  const existing = await prisma.user.findUnique({ where: { id } });
  if (
    existing?.role === 'super_admin' &&
    authUser.user.app_metadata?.role === 'super_admin'
  ) {
    console.log(`Already super_admin: ${email}`);
    return;
  }

  // Actualizar DB + app_metadata en una secuencia controlada
  await prisma.user.update({
    where: { id },
    data: { role: 'super_admin' },
  });

  const { error: metaError } = await supabaseAdmin.auth.admin.updateUser(id, {
    app_metadata: { role: 'super_admin' },
  });

  if (metaError) {
    // Revertir DB si falla el sync
    await prisma.user.update({ where: { id }, data: { role: null } });
    console.error('Failed to sync app_metadata, rolled back DB');
    process.exit(1);
  }

  console.log(`Super admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
