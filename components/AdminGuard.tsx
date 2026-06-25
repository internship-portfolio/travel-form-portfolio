"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("AdminGuard が実行されました");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        console.log("未ログインなので /login に移動します");
        setUser(null);
        setChecking(false);
        router.push("/login");
        return;
      }

      const tokenResult = await currentUser.getIdTokenResult(true);
      console.log("claims:", tokenResult.claims);

      if (tokenResult.claims.admin !== true) {
        console.log("管理者ではないので /login に移動します");
        setUser(null);
        setChecking(false);
        alert("管理者権限がありません");
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p>ログイン状態を確認中...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}