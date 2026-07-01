import { SurveyType } from '@prisma/client';
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

export async function findAllOnboarding(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        surveyResponses: {
          where: { surveyType: 'onboarding' as SurveyType },
          select: { responses: true, submittedAt: true },
          take: 1,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  const data = users.map((u) => ({
    userId: u.id,
    name: u.fullName,
    email: u.email,
    answers: (u.surveyResponses[0]?.responses ?? []) as Array<{
      question_id: string;
      answer: string | string[];
    }>,
    created_at:
      (u.surveyResponses[0]?.submittedAt ?? null)?.toISOString() ?? null,
  }));

  return { data, total, page, limit };
}
