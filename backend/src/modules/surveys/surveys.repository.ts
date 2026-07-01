import { SurveyType } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.client.js';
import type { OnboardingSurveyInput } from './surveys.validators.js';

export async function existsByUserAndType(
  userId: string,
  surveyType: SurveyType,
): Promise<boolean> {
  const existing = await prisma.surveyResponse.findFirst({
    where: {
      userId,
      surveyType,
    },
  });

  return existing !== null;
}

export async function create(
  userId: string,
  surveyType: SurveyType,
  responses: OnboardingSurveyInput['responses'],
): Promise<void> {
  await prisma.surveyResponse.create({
    data: {
      userId,
      surveyType,
      eventId: null,
      responses,
    },
  });
}

export async function findAllOnboarding() {
  const rows = await prisma.surveyResponse.findMany({
    where: { surveyType: 'onboarding' as SurveyType },
    select: {
      userId: true,
      responses: true,
      submittedAt: true,
      user: {
        select: { fullName: true, email: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  return rows.map((r) => ({
    userId: r.userId,
    userName: r.user?.fullName ?? null,
    userEmail: r.user?.email ?? null,
    answers: r.responses,
    submittedAt: r.submittedAt,
  }));
}
