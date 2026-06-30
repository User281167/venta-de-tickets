import { SurveyType } from '../../generated/prisma/client.js';
import * as surveysRepo from './surveys.repository.js';
import type { OnboardingSurveyInput } from './surveys.validators.js';

// Enviar respuestas a la encuesta de incorporación
// Implementa idempotencia: si la encuesta ya existe, no hacer nada y devolver éxito
export async function submitOnboardingSurvey(
  userId: string,
  input: OnboardingSurveyInput,
): Promise<{ status: 'ok' | 'duplicate'; surveyType: SurveyType; responseCount: number }> {
  const surveyType: SurveyType = 'onboarding';

  const alreadyExists = await surveysRepo.existsByUserAndType(userId, surveyType);

  if (alreadyExists) {
    return {
      status: 'ok',
      surveyType,
      responseCount: 0,
    };
  }

  // Crear la respuesta a la encuesta
  // Nota: Se acepta un array de respuestas vacío (representa una omisión)
  await surveysRepo.create(userId, surveyType, input.responses);

  return {
    status: 'ok',
    surveyType,
    responseCount: input.responses.length,
  };
}

export async function isOnboardingDone(userId: string): Promise<boolean> {
  return surveysRepo.existsByUserAndType(userId, 'onboarding');
}
