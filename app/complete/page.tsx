import Link from "next/link";

export default function CompletePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold">送信が完了しました</h1>

        <p className="mt-4 text-gray-600">
          フォームの回答を受け付けました。
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}