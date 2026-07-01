"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function FirebaseFormsPage() {
  return <FirebaseFormsContent />;
}

function FirebaseFormsContent() {
  const [forms, setForms] = useState<FirebaseForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchForms() {
      try {
        const formsQuery = query(collection(db, "forms"));
        const snapshot = await getDocs(formsQuery);

        const formsData: FirebaseForm[] = snapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as FirebaseForm
          )
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate().getTime() ?? 0;
            const bTime = b.createdAt?.toDate().getTime() ?? 0;
            return bTime - aTime;
          });

        setForms(formsData);
      } catch (error) {
        console.error(error);
        setErrorMessage("フォーム一覧の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    fetchForms();
  }, []);

  const statusList = useMemo(() => {
    const statuses = forms
      .map((form) => form.status)
      .filter((status): status is string => Boolean(status));

    return Array.from(new Set(statuses));
  }, [forms]);

  const filteredForms = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return forms.filter((form) => {
      const title = form.title?.toLowerCase() ?? "";
      const description = form.description?.toLowerCase() ?? "";
      const slug = form.slug?.toLowerCase() ?? "";
      const status = form.status ?? "";

      const matchesKeyword =
        keyword === "" ||
        title.includes(keyword) ||
        description.includes(keyword) ||
        slug.includes(keyword);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [forms, searchText, statusFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p>フォーム一覧を読み込み中...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Firebase版フォーム一覧</h1>
            <p className="mt-1 text-gray-600">
              Firestoreに保存されたフォームを一覧表示します。
            </p>
          </div>

          <Link
            href="/admin/firebase/forms/new"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            新規フォーム作成
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold">
              キーワード検索
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="フォーム名・説明・slugで検索"
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              ステータス絞り込み
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="all">すべて</option>
              {statusList.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          作成済みフォーム数：{forms.length} 件 / 表示中：
          {filteredForms.length} 件
        </div>

        {filteredForms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">フォーム名</th>
                  <th className="border p-2">説明</th>
                  <th className="border p-2">公開URL</th>
                  <th className="border p-2">状態</th>
                  <th className="border p-2">作成日時</th>
                  <th className="border p-2">操作</th>
                </tr>
              </thead>

              <tbody>
                {filteredForms.map((form) => (
                  <tr key={form.id}>
                    <td className="border p-2 font-medium">
                      {form.title || "-"}
                    </td>

                    <td className="border p-2">
                      {form.description || "-"}
                    </td>

                    <td className="border p-2">
                      {form.slug ? (
                        <Link
                          href={`/firebase/forms/${form.slug}`}
                          className="text-blue-600 underline"
                        >
                          /firebase/forms/{form.slug}
                        </Link>
                      ) : (
                        <span className="text-gray-500">未設定</span>
                      )}
                    </td>

                    <td className="border p-2">{form.status || "-"}</td>

                    <td className="border p-2">
                      {form.createdAt
                        ? form.createdAt.toDate().toLocaleString("ja-JP")
                        : "-"}
                    </td>

                    <td className="border p-2">
                      <div className="flex flex-col gap-2">
                        {form.slug && (
                          <Link
                            href={`/firebase/forms/${form.slug}`}
                            className="rounded bg-blue-600 px-3 py-1 text-center text-white hover:bg-blue-700"
                          >
                            公開フォーム
                          </Link>
                        )}

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
            条件に一致するフォームはありません。
          </p>
        )}
      </div>
    </main>
  );
}