import NextLink from "next/link";
import { IconArrowUpRight, IconUserPlus } from "@tabler/icons-react";

export function RegistrationFloat() {
  return (
    <NextLink
      href="/registrate"
      className="!fixed !bottom-5 !right-4 !z-[120] !inline-flex !items-center !gap-2 !rounded-full !border !border-white/25 !bg-[#f5bd35] !px-5 !py-3 !text-sm !font-bold !text-[#08142b] !shadow-[0_10px_36px_rgba(245,189,53,.3)] !transition-[transform,background-color,box-shadow] hover:!scale-[1.03] hover:!bg-[#ffd46d] hover:!shadow-[0_12px_42px_rgba(245,189,53,.4)] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-white"
    >
      <IconUserPlus size={18} aria-hidden="true" />
      <span>Regístrate</span>
      <IconArrowUpRight size={16} aria-hidden="true" />
    </NextLink>
  );
}
