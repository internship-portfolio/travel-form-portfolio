"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (checking) {
    return <p>ログイン状態を確認中...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">管理者ページ</h1>

        <p className="mt-2 text-gray-600">
          {user?.email} としてログイン中です。
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/admin/firebase/forms"
            className="rounded bg-blue-600 px-4 py-2 text-center font-bold text-white hover:bg-blue-700"
          >
            フォーム一覧へ
          </Link>

          <Link
            href="/admin/firebase/forms/new"
            className="rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            新規フォーム作成
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}