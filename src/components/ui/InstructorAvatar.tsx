import type { InstructorId } from "@/lib/types";
import { instructorById } from "@/lib/data";
import { cn } from "./cn";

// Muted, distinct identity tints — decoration only, the name always sits beside it.
const TINTS: Record<InstructorId, string> = {
  okampo: "from-[#3a4a2a] to-[#1f2717] text-[#d6ef9a]",
  victoria: "from-[#2f3a5c] to-[#1a2033] text-[#b9c8f5]",
  regina: "from-[#4f3350] to-[#2a1c2b] text-[#efc1ee]",
  tzah: "from-[#553a2a] to-[#2d1f17] text-[#f3c9a8]",
  razi: "from-[#24474a] to-[#142729] text-[#a5e3e6]",
  tair: "from-[#45402a] to-[#262317] text-[#ece0a4]",
};

export function InstructorAvatar({
  id,
  size = "md",
  className,
}: {
  id: InstructorId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const name = instructorById(id).name;
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0 rounded-full bg-gradient-to-br ring-1 ring-inset ring-white/10 grid place-items-center font-semibold",
        size === "sm" && "size-6 text-[11px]",
        size === "md" && "size-9 text-[14px]",
        size === "lg" && "size-12 text-[18px]",
        TINTS[id],
        className,
      )}
    >
      {name[0]}
    </span>
  );
}
