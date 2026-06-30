import type { Request, Response } from 'express';
import * as surveysService from './surveys.service.js';
import { onboardingSurveySchema } from './surveys.validators.js';

export async function submitOnboardingSurvey(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = onboardingSurveySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      },
    });

    return;
  }

  const result = await surveysService.submitOnboardingSurvey(
    req.user!.id,
    parsed.data,
  );

  res.json({
    status: result.status,
    survey_type: result.surveyType,
    response_count: result.responseCount,
  });
}
