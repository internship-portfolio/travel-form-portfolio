"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const tokenResult = await currentUser.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
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
    return <p>ログイン状態を確認中...</p>;
  }

  return (
    <main>
      <h1>管理者ページ</h1>
      <p>{user?.email} としてログイン中です。</p>

      <a href="/admin/responses">回答一覧を見る</a>
    </main>
  );
}