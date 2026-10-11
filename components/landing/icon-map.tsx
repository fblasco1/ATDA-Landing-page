import { getLandingIcon } from "./icon-catalog";
import type { FocusIcon, ValueIcon } from "@/lib/sanity/types";

export function ValueIconView({ name, className }: { name: ValueIcon; className?: string }) {
  const { Icon } = getLandingIcon(name);
  return <Icon className={className} />;
}

export function FocusIconView({ name, className }: { name: FocusIcon; className?: string }) {
  const { Icon } = getLandingIcon(name);
  return <Icon className={className} />;
}

export function LandingIconView({ name, className }: { name: string; className?: string }) {
  const { Icon } = getLandingIcon(name);
  return <Icon className={className} />;
}
