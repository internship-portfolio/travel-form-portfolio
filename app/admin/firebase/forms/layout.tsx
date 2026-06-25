"use client";

import type { ReactNode } from "react";
import AdminGuard from "@/components/AdminGuard";

type Props = {
  children: ReactNode;
};

export default function AdminFirebaseFormsLayout({ children }: Props) {
  return <AdminGuard>{children}</AdminGuard>;
}