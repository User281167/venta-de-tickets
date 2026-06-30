-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('onboarding', 'event_survey');

-- AlterTable
ALTER TABLE "survey_responses" ADD COLUMN "survey_type" "SurveyType" NOT NULL DEFAULT 'event_survey';

-- AlterTable
ALTER TABLE "survey_responses" ALTER COLUMN "event_id" DROP NOT NULL;

-- CreateUnique
CREATE UNIQUE INDEX "user_survey_type_unique" ON "survey_responses"("user_id", "survey_type");
