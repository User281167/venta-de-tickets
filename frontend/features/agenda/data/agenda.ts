import {
  IconBrain,
  IconBulb,
  IconDeviceLaptop,
  IconMicrophone2,
  IconRocket,
  IconTicket,
  IconTrophy,
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
        time: "Jornada Mañana",
        title: "Apertura Institucional",
        description:
          "Acto de bienvenida a cargo de las directivas de la UTP y la ASE que da inicio oficial a la XXIV Asociación de Egresados UTP en el campus inteligente.",
        track: "Keynote",
        icon: IconMicrophone2,
        image:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Mañana",
        title: "Talleres Especializados en IA",
        description:
          "Sesiones prácticas para aplicar inteligencia artificial a la docencia, la investigación, los servicios estudiantiles y la gestión académica, personalizando la educación superior.",
        track: "Taller",
        icon: IconDeviceLaptop,
        image:
          "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Mañana",
        title: "Laboratorio Aplicado IA",
        description:
          "Espacio hands-on donde los asistentes prototipan soluciones de IA para casos reales del Eje Cafetero junto a mentores del ecosistema.",
        track: "Workshop",
        icon: IconBrain,
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Tarde",
        title: "Taller Visión Estratégica IA",
        description:
          "Conversación de liderazgo regional sobre cómo la IA transforma la academia, los negocios y el impacto social de cara al Smart Campus del futuro.",
        track: "Taller",
        icon: IconRocket,
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Tarde",
        title: "Talleres Especializados en IA",
        description:
          "Segunda ronda de talleres especializados en IA con foco en transformación digital, automatización e innovación aplicada a organizaciones de la región.",
        track: "Taller",
        icon: IconDeviceLaptop,
        image:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Cierre",
        title: "Música Electrónica y Rock",
        description:
          "Cierre de la jornada inaugural con un concierto en vivo que combina electrónica y rock para celebrar el reencuentro de la comunidad UTP.",
        track: "Cierre",
        icon: IconTrophy,
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
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
        time: "Jornada Mañana",
        title: "Conferencia Magistral",
        description:
          "Conferencia central con un invitado de alto nivel que marca la conversación sobre el futuro de la educación, la innovación y la región en el marco de la XXIV de la Asociación de Egresados UTP.",
        track: "Keynote",
        icon: IconMicrophone2,
        image:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Mañana",
        title: "Conferencia Visión Institucional",
        description:
          "ASE comparte la visión institucional de la UTP hacia el Smart Campus, la transformación digital y el impacto regional.",
        track: "Keynote",
        icon: IconMicrophone2,
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Mañana",
        title: "Panel: la Universidad del Futuro",
        description:
          "Líderes académicos y de la industria debaten cómo la inteligencia artificial, la sostenibilidad y la equidad regional redefinen la universidad del mañana.",
        track: "Panel",
        icon: IconRocket,
        image:
          "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Tarde",
        title: "Networking",
        description:
          "Espacio diseñado para conectar a egresados, empresarios, aliados y asistentes en torno a los proyectos que lidera la UTP y la ASE.",
        track: "Networking",
        icon: IconDeviceLaptop,
        image:
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Cierre",
        title: "Ceremonia de Gala y Condecoración",
        description:
          "Gala de cierre con reconocimientos a egresados, aliados y líderes que han hecho posible la transformación de la UTP y de la región.",
        track: "Cierre",
        icon: IconTrophy,
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    date: "24 de Octubre 2026",
    weekday: "Día 3",
    theme: "Bienestar, Cultura y Cierre",
    color: "#ff0f7b",
    icon: IconRocket,
    events: [
      {
        time: "Jornada Mañana",
        title: "Actividades de Bienestar",
        description:
          "Espacios de bienestar físico y mental para egresados y asistentes: activación, autocuidado y conexión con la naturaleza, alineados con la dimensión de bienestar de la Asociación de Egresados UTP.",
        track: "Networking",
        icon: IconDeviceLaptop,
        image:
          "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Mañana",
        title: "Avistamiento de Aves",
        description:
          "Recorrido guiado por los entornos naturales del campus para descubrir la biodiversidad regional, una experiencia que conecta a los asistentes con la sostenibilidad y el territorio.",
        track: "Networking",
        icon: IconRocket,
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Tarde",
        title: "Asamblea General de la ASE UTP",
        description:
          "Espacio institucional de la Asociación de Egresados UTP para presentar balance, proyectos y elección de representantes ante la comunidad asociada.",
        track: "Panel",
        icon: IconMicrophone2,
        image:
          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Tarde",
        title: "Tardeo con Muestra Artística y Cultural UTP",
        description:
          "Tardeo cultural con muestra artística y cultural de la UTP: música en vivo, expresiones artísticas y reconocimiento al talento de la comunidad universitaria.",
        track: "Demo",
        icon: IconTrophy,
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      },
      {
        time: "Jornada Noche",
        title: "Gran Concierto y Cierre del Evento",
        description:
          "Cierre oficial de la XXIV de la Asociación de Egresados UTP con un gran concierto que reúne a la comunidad UTP para celebrar tres días de inspiración, alianzas y reencuentro.",
        track: "Cierre",
        icon: IconTrophy,
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];
