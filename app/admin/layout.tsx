"use client";

import type { ReactNode } from "react";
import AdminGuard from "@/components/AdminGuard";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return <AdminGuard>{children}</AdminGuard>;
}