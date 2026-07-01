"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type FirebaseForm = {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
  createdAt?: {
    toDate: () => Date;
  };
};

export default function AdminPage() {
  const [forms, setForms] = useState<FirebaseForm[]>([]);
  const [formCount, setFormCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const formsSnapshot = await getDocs(query(collection(db, "forms")));
        const responsesSnapshot = await getDocs(
          query(collection(db, "responses"))
        );

        const formsData: FirebaseForm[] = formsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as FirebaseForm))
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate().getTime() ?? 0;
            const bTime = b.createdAt?.toDate().getTime() ?? 0;
            return bTime - aTime;
          });

        setForms(formsData.slice(0, 5));
        setFormCount(formsSnapshot.size);
        setResponseCount(responsesSnapshot.size);
      } catch (error) {
        console.error(error);
        setErrorMessage("ダッシュボード情報の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <p>ダッシュボードを読み込み中...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
          <p className="mt-2 text-gray-600">
            Firebase版フォーム管理システムの管理画面です。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              作成済みフォーム数
            </p>
            <p className="mt-2 text-3xl font-bold">{formCount}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              回答数
            </p>
            <p className="mt-2 text-3xl font-bold">{responseCount}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">最近作成されたフォーム</h2>

            <Link
              href="/admin/firebase/forms"
              className="text-sm font-medium text-blue-600 underline"
            >
              すべて見る
            </Link>
          </div>

          {forms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">フォーム名</th>
                    <th className="border p-2">説明</th>
                    <th className="border p-2">状態</th>
                    <th className="border p-2">作成日時</th>
                    <th className="border p-2">操作</th>
                  </tr>
                </thead>

                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id}>
                      <td className="border p-2 font-medium">
                        {form.title || "-"}
                      </td>

                      <td className="border p-2">
                        {form.description || "-"}
                      </td>

                      <td className="border p-2">
                        {form.status || "-"}
                      </td>

                      <td className="border p-2">
                        {form.createdAt
                          ? form.createdAt.toDate().toLocaleString("ja-JP")
                          : "-"}
                      </td>

                      <td className="border p-2">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/firebase/forms/${form.id}/fields`}
                            className="rounded bg-gray-700 px-3 py-1 text-center text-white hover:bg-gray-800"
                          >
                            質問項目編集
                          </Link>

                          <Link
                            href={`/admin/firebase/forms/${form.id}/responses`}
                            className="rounded bg-green-600 px-3 py-1 text-center text-white hover:bg-green-700"
                          >
                            回答一覧
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded border p-4 text-gray-600">
              まだフォームは作成されていません。
            </p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/firebase/forms"
            className="rounded-xl bg-blue-600 p-6 text-center font-bold text-white shadow hover:bg-blue-700"
          >
            フォーム一覧へ
          </Link>

          <Link
            href="/admin/firebase/forms/new"
            className="rounded-xl bg-white p-6 text-center font-bold shadow hover:bg-gray-50"
          >
            新規フォーム作成
          </Link>
        </section>
      </div>
    </main>
  );
}