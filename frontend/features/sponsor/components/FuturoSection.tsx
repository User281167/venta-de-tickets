"use client";

import { DimensionShowcase, type DimensionItem } from "@/shared/components/DimensionShowcase";
import { GradientText } from "@/shared/components/GradientText";
import { IconBrain, IconCpu, IconBolt, IconBulb, IconLeaf } from "@tabler/icons-react";

const ICON = { size: 20, stroke: 2 } as const;

const ITEMS: DimensionItem[] = [
  {
    key: "ia",
    number: "1",
    title: "Inteligencia Artificial",
    description:
      "IA aplicada a docencia, investigación, servicios estudiantiles y gestión académica para personalizar la educación superior.",
    icon: <IconBrain {...ICON} />,
  },
  {
    key: "smart-campus",
    number: "2",
    title: "Smart Campus",
    description:
      "Campus conectados con sensores, datos y plataformas inteligentes que mejoran la experiencia universitaria.",
    icon: <IconCpu {...ICON} />,
    image: "/assets/smart-campus.jpg",
  },
  {
    key: "transformacion",
    number: "3",
    title: "Transformación Digital",
    description:
      "Procesos, servicios y trámites rediseñados para una universidad ágil, abierta y centrada en el usuario.",
    icon: <IconBolt {...ICON} />,
  },
  {
    key: "investigacion",
    number: "4",
    title: "Investigación e Innovación",
    description:
      "Ecosistema que conecta semilleros, grupos, empresas y aliados para llevar ideas al mercado.",
    icon: <IconBulb {...ICON} />,
  },
  {
    key: "sostenibilidad",
    number: "5",
    title: "Sostenibilidad",
    description:
      "Universidad comprometida con el medio ambiente, la equidad regional y el impacto social medible.",
    icon: <IconLeaf {...ICON} />,
  },
];

export function FuturoSection() {
  return (
    <DimensionShowcase
      id="futuro"
      eyebrow="Visión"
      title={
        <>
          ¿Qué es la <GradientText>Universidad del Futuro</GradientText>?
        </>
      }
      subtitle="Cinco dimensiones que redefinen el rol de la UTP en la región y en el país."
      items={ITEMS}
      defaultImage="/assets/smart-campus.jpg"
      accentColor="cyan"
    />
  );
}
