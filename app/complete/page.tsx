import Link from "next/link";

export default function CompletePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <h1 className="mb-4 text-2xl font-bold">
          送信完了
        </h1>

        <p className="mb-6 text-gray-600">
          回答を送信しました。ありがとうございました。
        </p>

        <Link
          href="/form/sample"
          className="text-blue-600 underline"
        >
          フォームに戻る
        </Link>
      </div>
    </main>
  );
}