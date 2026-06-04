import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function AdminFormsPage() {
  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);

    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">フォーム一覧</h1>
          <p className="text-red-600">フォーム一覧の取得に失敗しました。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">フォーム一覧</h1>
            <p className="mt-1 text-gray-600">
              作成済みフォームの公開URL、質問項目、回答一覧を確認できます。
            </p>
          </div>

          <Link
            href="/admin/forms/new"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            新規フォーム作成
          </Link>
        </div>

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          作成済みフォーム数：{forms?.length ?? 0} 件
        </div>

        {forms && forms.length > 0 ? (
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
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td className="border p-2 font-medium">
                      {form.title}
                    </td>

                    <td className="border p-2">
                      {form.description || '-'}
                    </td>

                    <td className="border p-2">
                      {form.slug ? (
                        <Link
                          href={`/forms/${form.slug}`}
                          className="text-blue-600 underline"
                        >
                          /forms/{form.slug}
                        </Link>
                      ) : (
                        <span className="text-gray-500">未設定</span>
                      )}
                    </td>

                    <td className="border p-2">
                      {form.status || '-'}
                    </td>

                    <td className="border p-2">
                      {new Date(form.created_at).toLocaleString('ja-JP')}
                    </td>

                    <td className="border p-2">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/forms/${form.id}/fields`}
                          className="rounded bg-gray-700 px-3 py-1 text-center text-white hover:bg-gray-800"
                        >
                          質問項目編集
                        </Link>

                        <Link
                          href={`/admin/forms/${form.id}/responses`}
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
      </div>
    </main>
  );
}