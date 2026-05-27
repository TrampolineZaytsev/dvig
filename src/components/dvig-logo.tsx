import Image from "next/image";
import { cn } from "@/lib/utils";

type DvigLogoProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizes = {
  sm: { box: "size-9", px: 36 },
  md: { box: "size-11", px: 44 },
} as const;

export function DvigLogo({ size = "md", className }: DvigLogoProps) {
  const { box, px } = sizes[size];

  return (
    <span
      className={cn(
        "dvig-logo relative overflow-hidden p-0 transition group-hover:shadow-primary/40",
        box,
        className,
      )}
    >
      <Image
        src="/dvig-logo.png"
        alt="ДВИГ"
        width={px}
        height={px}
        className="size-full object-cover"
        priority
      />
    </span>
  );
}
