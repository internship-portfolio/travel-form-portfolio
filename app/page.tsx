import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-4 text-3xl font-bold">
          フォーム管理システム
        </h1>

        <p className="mb-6 text-gray-600">
          Web上でフォームを公開し、送信された回答を管理画面で一括確認できるプロトタイプです。
        </p>

        <div className="space-y-3">
          <Link
            href="/form/sample"
            className="block rounded bg-blue-600 px-4 py-2 text-center font-bold text-white hover:bg-blue-700"
          >
            公開フォームを開く
          </Link>

          <Link
            href="/admin/responses"
            className="block rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            管理画面を開く
          </Link>
          <Link
            href="/admin/forms/new"
            className="block rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            フォームを作成する
          </Link>
          <Link
            href="/admin/forms"
            className="block rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            フォーム一覧を開く
          </Link>
          <Link
            href="/admin/firebase/forms"
            className="block rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            Firebase版フォーム一覧を開く
          </Link>

          <Link
            href="/admin/firebase/forms/new"
            className="block rounded border px-4 py-2 text-center font-bold hover:bg-gray-100"
          >
            Firebase版フォームを作成する
          </Link>
        </div>
      </div>
    </main>
  );
}