import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">
          フォーム管理システム
        </h1>

        <p className="mt-2 text-gray-600">
          Firebase版のフォーム管理画面です。
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded bg-blue-600 px-4 py-2 text-center font-bold text-white hover:bg-blue-700"
          >
            管理者ログイン
          </Link>

          <Link
            href="/admin"
            className="rounded bg-gray-700 px-4 py-2 text-center font-bold text-white hover:bg-gray-800"
          >
            管理画面を開く
          </Link>

          <Link
            href="/admin/firebase/forms"
            className="rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            Firebase版フォーム一覧
          </Link>

          <Link
            href="/admin/firebase/forms/new"
            className="rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            Firebase版フォーム作成
          </Link>
        </div>
      </div>
    </main>
  );
}