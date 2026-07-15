import {
  IconBrain,
  IconBulb,
  IconChartBar,
  IconClock,
  IconCoffee,
  IconDeviceLaptop,
  IconMicrophone2,
  IconRocket,
  IconTicket,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export type Track =
  | "Keynote"
  | "Panel"
  | "Taller"
  | "Workshop"
  | "Networking"
  | "Demo"
  | "Cierre";

export type AgendaEvent = {
  time: string;
  title: string;
  description: string;
  speakers?: string[];
  track: Track;
  icon: ComponentType<{ size?: number; color?: string }>;
  image: string;
};

export type AgendaDay = {
  date: string;
  weekday: string;
  theme: string;
  color: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  events: AgendaEvent[];
};

const TRACK_COLORS: Record<Track, string> = {
  Keynote: "#ff0f7b",
  Panel: "#7c3cff",
  Taller: "#00e5ff",
  Workshop: "#00d5b8",
  Networking: "#ff9f1c",
  Demo: "#0969ff",
  Cierre: "#ff0f7b",
};

export function getTrackColor(track: Track) {
  return TRACK_COLORS[track];
}

export const AGENDA_DAYS: AgendaDay[] = [
  {
    date: "22 de Octubre 2026",
    weekday: "Día 1",
    theme: "Apertura e Innovación",
    color: "#00d5b8",
    icon: IconTicket,
    events: [
      {
        time: "09:00",
        title: "Registro y bienvenida",
        description:
          "Recoge tu acreditación, conoce el venue y conecta con los primeros asistentes antes de comenzar.",
        track: "Networking",
        icon: IconCoffee,
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "10:00",
        title: "Keynote: Innovación en Colombia",
        description:
          "Una mirada panorámica a los ecosistemas de innovación, las oportunidades del momento y lo que viene para el país.",
        speakers: ["Dra. Carolina Mendoza", "Alejandro Ruiz"],
        track: "Keynote",
        icon: IconMicrophone2,
        image:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "11:30",
        title: "Panel: Emprender sin capital",
        description:
          "Fundadores comparten cómo construyeron sus primeras empresas con recursos limitados y mucha creatividad.",
        speakers: ["Lucía Torres", "Miguel Pérez", "Sofía Castro"],
        track: "Panel",
        icon: IconUsers,
        image:
          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "14:00",
        title: "Taller: Transformación digital",
        description:
          "Herramientas prácticas para digitalizar procesos de cualquier organización sin perder la esencia humana.",
        speakers: ["Andrés Vargas"],
        track: "Taller",
        icon: IconDeviceLaptop,
        image:
          "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "16:00",
        title: "Networking: Conecta UTP",
        description:
          "Espacio informal para intercambiar contactos con egresados, empresarios y aliados del ecosistema.",
        track: "Networking",
        icon: IconUsers,
        image:
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    date: "23 de Octubre 2026",
    weekday: "Día 2",
    theme: "Tecnología e Inteligencia Artificial",
    color: "#7c3cff",
    icon: IconBulb,
    events: [
      {
        time: "09:30",
        title: "Workshop: IA para negocios",
        description:
          "De la teoría a la práctica: implementa modelos de inteligencia artificial que aporten valor real a tu empresa.",
        speakers: ["Fernando López"],
        track: "Workshop",
        icon: IconBrain,
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "11:00",
        title: "Panel: Fintech colombiano",
        description:
          "Los actores clave del sector financiero digital conversan sobre inclusión, regulación y nuevos modelos.",
        speakers: ["Camila Rojas", "Daniel Herrera"],
        track: "Panel",
        icon: IconChartBar,
        image:
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "13:00",
        title: "Networking lunch",
        description:
          "Un almuerzo diseñado para conversar con mentores, inversionistas y otros participantes de la convención.",
        track: "Networking",
        icon: IconCoffee,
        image:
          "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "15:00",
        title: "Charla: Escalando startups",
        description:
          "Lecciones de crecimiento, cultura organizacional y toma de decisiones en etapas de alta velocidad.",
        speakers: ["Valentina Gómez"],
        track: "Keynote",
        icon: IconRocket,
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "17:00",
        title: "Demo de productos",
        description:
          "Startups del ecosistema UTP presentan sus productos en sesiones rápidas de cinco minutos cada una.",
        track: "Demo",
        icon: IconDeviceLaptop,
        image:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    date: "24 de Octubre 2026",
    weekday: "Día 3",
    theme: "Cierre, Startups y Premiación",
    color: "#ff0f7b",
    icon: IconRocket,
    events: [
      {
        time: "08:30",
        title: "Sesión de apertura",
        description:
          "Bienvenida al último día con un resumen de los aprendizajes y los retos que vienen.",
        speakers: ["Equipo organizador"],
        track: "Keynote",
        icon: IconMicrophone2,
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "10:00",
        title: "Demo day: Startups",
        description:
          "Las startups finalistas presentan ante un jurado de inversionistas y ganan visibilidad nacional.",
        speakers: ["5 startups finalistas"],
        track: "Demo",
        icon: IconRocket,
        image:
          "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "13:00",
        title: "Almuerzo de cierre",
        description:
          "Última oportunidad para cerrar acuerdos, intercambiar contactos y celebrar lo construido en tres días.",
        track: "Networking",
        icon: IconCoffee,
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "16:00",
        title: "Premiación y cierre",
        description:
          "Anuncio de ganadores, reconocimientos a la comunidad UTP y un mensaje de cierre para el futuro.",
        speakers: ["Rector UTP"],
        track: "Cierre",
        icon: IconTrophy,
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];
