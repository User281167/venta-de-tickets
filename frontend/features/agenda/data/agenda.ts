import {
  IconBrain,
  IconBuildingCommunity,
  IconBuildingStore,
  IconHeartHandshake,
  IconMicrophone2,
  IconMusic,
  IconNetwork,
  IconTrophy,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export type Track =
  | "Feria"
  | "Institucional"
  | "Futuro"
  | "Encuentro"
  | "Solidaridad"
  | "Cultura";

export type AgendaEvent = {
  time: string;
  title: string;
  description: string;
  note?: string;
  speakers?: string[];
  track: Track;
  icon: ComponentType<{ size?: number; color?: string }>;
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
  Feria: "#f5bd35",
  Institucional: "#48a8ff",
  Futuro: "#00d7e8",
  Encuentro: "#b18cff",
  Solidaridad: "#ff7188",
  Cultura: "#4de0bd",
};

export function getTrackColor(track: Track) {
  return TRACK_COLORS[track];
}

export const AGENDA_DAYS: AgendaDay[] = [
  {
    date: "Sábado 24 de octubre de 2026",
    weekday: "Sábado",
    theme: "Encuentro, Reactivación y Solidaridad",
    color: "#f5bd35",
    icon: IconHeartHandshake,
    events: [
      {
        time: "Durante todo el día",
        title:
          "Feria de empleabilidad, emprendimiento y reactivación empresarial",
        description:
          "Espacio para conectar egresados, empresas, emprendedores, oportunidades laborales, productos y servicios. Participan egresados emprendedores o pymes y emprendedores barranqueros.",
        track: "Feria",
        icon: IconBuildingStore,
      },
      {
        time: "8:30 a. m.",
        title: "Apertura de la Convención",
        description:
          "Instalación institucional de La U del Futuro 2026 y presentación del propósito académico, empresarial y solidario de la jornada.",
        track: "Institucional",
        icon: IconMicrophone2,
      },
      {
        time: "9:00–9:30 a. m.",
        title: "Inteligencia artificial y perspectiva",
        description:
          "Conferencia de apertura sobre inteligencia artificial, reactivación económica, transformación y retos de la Universidad del Futuro.",
        track: "Futuro",
        icon: IconBrain,
      },
      {
        time: "9:30–10:00 a. m.",
        title: "Visión institucional: La Universidad del Futuro",
        description:
          "Presentación de la visión institucional y los desafíos de la UTP frente al futuro, la innovación y la transformación tecnológica.",
        track: "Institucional",
        icon: IconMicrophone2,
      },
      {
        time: "10:30–11:30 a. m.",
        title: "Panel de expertos en inteligencia artificial",
        description:
          "Conversación sobre inteligencia artificial, universidad, sociedad, empleabilidad, empresa y transformación.",
        track: "Futuro",
        icon: IconBrain,
      },
      {
        time: "11:30 a. m.–12:30 p. m.",
        title: "Conferencias temáticas por facultades",
        description:
          "Conversaciones virtuales sobre temas de interés de las facultades.",
        track: "Futuro",
        icon: IconBuildingCommunity,
      },
      {
        time: "12:30–2:00 p. m.",
        title: "Feria gastronómica y música en vivo",
        description:
          "Feria gastronómica para empresarios egresados y franja libre de almuerzo. La feria podrá continuar como espacio de encuentro y circulación.",
        track: "Feria",
        icon: IconMusic,
      },
      {
        time: "2:00–4:30 p. m.",
        title: "Asamblea de la ASEUTP",
        description:
          "Espacio estatutario e institucional para la participación de los egresados.",
        track: "Institucional",
        icon: IconBuildingCommunity,
      },
      {
        time: "4:30–6:30 p. m.",
        title: "Networking de egresados",
        description:
          "Encuentro de relacionamiento entre nuestra comunidad universitaria.",
        track: "Encuentro",
        icon: IconNetwork,
      },
      {
        time: "6:30–7:00 p. m.",
        title: "Memoria y conmemoración",
        description: "Homenaje a las víctimas del terremoto del 10 de agosto.",
        track: "Solidaridad",
        icon: IconHeartHandshake,
      },
      {
        time: "7:00–8:00 p. m.",
        title: "Ceremonia de Egresados Distinguidos",
        description:
          "Reconocimiento institucional a egresados destacados y encuentro solemne de la comunidad.",
        track: "Institucional",
        icon: IconTrophy,
      },
      {
        time: "Cierre",
        title: "Noche cultural",
        description:
          "Presentación de la orquesta sinfónica con artista invitado.",
        track: "Cultura",
        icon: IconMusic,
      },
    ],
  },
];
