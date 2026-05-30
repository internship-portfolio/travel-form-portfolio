import { createForm } from '@/app/actions/createForm';

export default function NewFormPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          フォーム作成
        </h1>

        <p className="mb-6 text-gray-600">
          新しい公開フォームを作成します。
        </p>

        <form action={createForm} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">
              フォーム名
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full rounded border p-2"
              placeholder="例：旅行申込フォーム"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              説明文
            </label>
            <textarea
              name="description"
              className="h-24 w-full rounded border p-2"
              placeholder="フォームの説明を入力してください"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              公開URL名
            </label>
            <input
              type="text"
              name="slug"
              required
              className="w-full rounded border p-2"
              placeholder="例：travel-application"
            />
            <p className="mt-1 text-sm text-gray-500">
              半角英数字とハイフンで入力してください。例：travel-application
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            フォームを作成する
          </button>
        </form>
      </div>
    </main>
  );
}