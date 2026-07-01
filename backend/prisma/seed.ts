import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/shared/database/prisma.client.js';

const SUPABASE_URL = process.env['SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedAdmin() {
  const id = process.env['SUPER_ADMIN_ID'];
  const email = process.env['SUPER_ADMIN_EMAIL'];

  if (!id || !email) {
    console.error('Missing SUPER_ADMIN_ID or SUPER_ADMIN_EMAIL in .env');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { id } });

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

async function seedEvent() {
  const title = 'Future Minds 2026';
  const existingEvent = await prisma.event.findFirst({ where: { title } });

  if (existingEvent) {
    console.log(`Event already exists: ${existingEvent.title}`);
    return existingEvent;
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: 'El evento más importante del año para mentes innovadoras.',
      eventDate: new Date('2026-07-15T20:00:00Z'),
      doorsOpenAt: new Date('2026-07-15T18:00:00Z'),
      location: 'Centro de Eventos, Medellín',
      prefix: 'FM26',
      status: 'published',
    },
  });

  console.log(`Event created: ${event.title}`);
  return event;
}

async function seedTicketTypes(eventId: string) {
  const existingCount = await prisma.ticketType.count({ where: { eventId } });

  if (existingCount > 0) {
    console.log(`Ticket types already exist for event, skipping seed`);
    return;
  }

  const types = [
    {
      name: 'General',
      description: 'Entrada general al evento.',
      price: 120000,
      quantityTotal: 500,
      quantitySold: 0,
      maxPerUser: 4,
      isActive: true,
    },
    {
      name: 'Premium',
      description: 'Entrada premium con acceso a zona exclusiva y camiseta.',
      price: 250000,
      quantityTotal: 200,
      quantitySold: 0,
      maxPerUser: 4,
      isActive: true,
    },
    {
      name: 'VIP',
      description: 'Experiencia VIP: acceso total, cena y meet & greet.',
      price: 500000,
      quantityTotal: 50,
      quantitySold: 0,
      maxPerUser: 2,
      isActive: true,
    },
  ];

  for (const t of types) {
    await prisma.ticketType.create({
      data: { ...t, eventId },
    });
  }

  console.log(`${types.length} ticket types created`);
}

async function main() {
  await seedAdmin();
  const event = await seedEvent();

  if (event) {
    await seedTicketTypes(event.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
