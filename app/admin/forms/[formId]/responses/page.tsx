import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{
    formId: string;
  }>;
};

export default async function FormResponsesPage({ params }: Props) {
  const { formId } = await params;

  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (formError || !form) {
    console.error(formError);

    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">フォームが見つかりません。</p>
        </div>
      </main>
    );
  }

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('sort_order', { ascending: true });

  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(`
      id,
      created_at,
      response_answers (
        id,
        value,
        field_id
      )
    `)
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (fieldsError || responsesError) {
    console.error(fieldsError || responsesError);

    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">回答一覧</h1>
          <p className="text-red-600">回答データの取得に失敗しました。</p>
        </div>
      </main>
    );
  }

  const fieldList = fields ?? [];
  const responseList = responses ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {form.title} の回答一覧
            </h1>

            <p className="mt-1 text-gray-600">
              作成したフォームに送信された回答を一覧で確認できます。
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/forms"
              className="rounded border px-4 py-2 font-bold hover:bg-gray-100"
            >
              フォーム一覧へ
            </Link>

            <Link
              href={`/admin/forms/${form.id}/fields`}
              className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
            >
              質問項目編集
            </Link>

            {form.slug && (
              <Link
                href={`/forms/${form.slug}`}
                className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                公開フォーム
              </Link>
            )}
          </div>
        </div>

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          回答件数：{responseList.length} 件
        </div>

        {fieldList.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            このフォームには質問項目がありません。
          </p>
        ) : responseList.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            まだ回答はありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">送信日時</th>
                  {fieldList.map((field) => (
                    <th key={field.id} className="border p-2">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {responseList.map((response) => (
                  <tr key={response.id}>
                    <td className="border p-2">
                      {new Date(response.created_at).toLocaleString('ja-JP')}
                    </td>

                    {fieldList.map((field) => {
                      const answer = response.response_answers?.find(
                        (item) => item.field_id === field.id
                      );

                      return (
                        <td key={field.id} className="border p-2">
                          {answer?.value || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}