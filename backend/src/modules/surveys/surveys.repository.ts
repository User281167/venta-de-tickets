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
