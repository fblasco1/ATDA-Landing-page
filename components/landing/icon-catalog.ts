import type { ComponentType } from "react";
import {
  BiotechIcon,
  BlueprintIcon,
  BridgeIcon,
  BuildingIcon,
  ChipIcon,
  CollaborationIcon,
  ConveyorIcon,
  CraneIcon,
  DebateIcon,
  DevelopmentIcon,
  EnergyIcon,
  FactoryIcon,
  HardHatIcon,
  Industry40Icon,
  InstagramIcon,
  KnowledgeIcon,
  LinkedInIcon,
  MailIcon,
  MiningIcon,
  PipelineIcon,
  RobotIcon,
  RulerIcon,
  SolarIcon,
  TruckIcon,
  TwitterIcon,
  WrenchIcon,
} from "@/components/Icons";

export type LandingIconId =
  | "collaboration"
  | "debate"
  | "development"
  | "knowledge"
  | "energy"
  | "industry40"
  | "biotech"
  | "hardhat"
  | "building"
  | "crane"
  | "factory"
  | "wrench"
  | "blueprint"
  | "bridge"
  | "truck"
  | "pipeline"
  | "chip"
  | "robot"
  | "solar"
  | "mining"
  | "ruler"
  | "conveyor"
  | "mail"
  | "twitter"
  | "linkedin"
  | "instagram";

type IconComponent = ComponentType<{ className?: string }>;

export type LandingIconOption = {
  id: LandingIconId;
  label: string;
  Icon: IconComponent;
};

/** Catálogo de íconos disponibles en el CMS de la landing. */
export const LANDING_ICON_OPTIONS: LandingIconOption[] = [
  { id: "hardhat", label: "Obra / casco", Icon: HardHatIcon },
  { id: "building", label: "Edificación", Icon: BuildingIcon },
  { id: "crane", label: "Grúa / construcción", Icon: CraneIcon },
  { id: "factory", label: "Fábrica", Icon: FactoryIcon },
  { id: "conveyor", label: "Línea industrial", Icon: ConveyorIcon },
  { id: "wrench", label: "Ingeniería / herramientas", Icon: WrenchIcon },
  { id: "blueprint", label: "Plano técnico", Icon: BlueprintIcon },
  { id: "ruler", label: "Medición", Icon: RulerIcon },
  { id: "bridge", label: "Infraestructura", Icon: BridgeIcon },
  { id: "truck", label: "Logística", Icon: TruckIcon },
  { id: "pipeline", label: "Ductos / oil & gas", Icon: PipelineIcon },
  { id: "mining", label: "Minería", Icon: MiningIcon },
  { id: "energy", label: "Energía", Icon: EnergyIcon },
  { id: "solar", label: "Energía solar", Icon: SolarIcon },
  { id: "industry40", label: "Industria 4.0", Icon: Industry40Icon },
  { id: "chip", label: "Electrónica / chips", Icon: ChipIcon },
  { id: "robot", label: "Automatización", Icon: RobotIcon },
  { id: "biotech", label: "Biotecnología", Icon: BiotechIcon },
  { id: "development", label: "Desarrollo", Icon: DevelopmentIcon },
  { id: "collaboration", label: "Vinculación", Icon: CollaborationIcon },
  { id: "debate", label: "Debate", Icon: DebateIcon },
  { id: "knowledge", label: "Conocimiento", Icon: KnowledgeIcon },
  { id: "mail", label: "Email", Icon: MailIcon },
  { id: "twitter", label: "X / Twitter", Icon: TwitterIcon },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { id: "instagram", label: "Instagram", Icon: InstagramIcon },
];

const iconMap = Object.fromEntries(
  LANDING_ICON_OPTIONS.map((option) => [option.id, option]),
) as Record<LandingIconId, LandingIconOption>;

export function getLandingIcon(id: string | undefined | null): LandingIconOption {
  if (id && id in iconMap) return iconMap[id as LandingIconId];
  return iconMap.collaboration;
}

export function isLandingIconId(value: string): value is LandingIconId {
  return value in iconMap;
}
