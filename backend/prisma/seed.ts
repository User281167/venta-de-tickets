import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/shared/database/prisma.client.js';
import { env } from '../src/shared/config/env.js';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function createUser(
  email: string,
  password: string,
  fullName: string,
  role: 'super_admin' | 'admin',
) {
  // Buscar si ya existe
  const { data: users } = await supabase.auth.admin.listUsers();

  let authUser = users.users.find((u) => u.email === email);

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
      app_metadata: {
        role,
      },
    });

    if (error) throw error;

    authUser = data.user;

    // Esperar un momento para que el trigger inserte en public.users
    await new Promise((r) => setTimeout(r, 500));
  }

  await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      role,
      fullName,
    },
    create: {
      id: authUser.id,
      email,
      fullName,
      role,
    },
  });

  // Actualizar también el JWT
  await supabase.auth.admin.updateUserById(authUser.id, {
    app_metadata: {
      role,
    },
  });

  console.log(`✔ ${role}: ${email}`);
}

async function main() {
  await createUser(
    'superadmin@example.com',
    'superadmin123.!',
    'Super Admin',
    'super_admin',
  );

  await createUser('admin@example.com', 'admin123.!', 'Administrador', 'admin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
