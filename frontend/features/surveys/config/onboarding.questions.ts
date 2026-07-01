export const ONBOARDING_QUESTIONS = [
  {
    id: "gender",
    question: "¿Con qué género te identificas?",
    type: "single" as const,
    options: ["Masculino", "Femenino", "No binario", "Prefiero no decirlo"],
    required: false,
  },
  {
    id: "occupation",
    question: "¿Cuál es tu ocupación?",
    type: "single" as const,
    options: ["Estudiante", "Docente", "Profesional", "Empresario", "Otro"],
    required: false,
  },
  {
    id: "area",
    question: "¿En qué área o carrera?",
    type: "single" as const,
    options: [
      "Tecnología",
      "Recursos Humanos",
      "Estudiante",
      "Salud",
      "Educación",
      "Marketing",
      "Finanzas",
      "Ingeniería",
      "Arte y Diseño",
      "Otro",
    ],
    required: false,
  },
  {
    id: "how_heard",
    question: "¿Cómo te enteraste del evento?",
    type: "multi" as const,
    options: [
      "Redes sociales",
      "Email universitario",
      "Un amigo",
      "Cartelera campus",
      "Otro",
    ],
    required: false,
  },
] as const;

export type OnboardingQuestion = (typeof ONBOARDING_QUESTIONS)[number];
