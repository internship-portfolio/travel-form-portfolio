import { supabase } from '@/lib/supabase';
import { addFormField } from '@/app/actions/addFormField';
import Link from 'next/link';

type Props = {
  params: Promise<{
    formId: string;
  }>;
};

export default async function FormFieldsPage({ params }: Props) {
  const { formId } = await params;

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  const { data: fields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('sort_order', { ascending: true });

  if (!form) {
    return (
      <main className="p-6">
        <p>フォームが見つかりません。</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          質問項目の編集
        </h1>

        <p className="mb-6 text-gray-600">
          {form.title}
        </p>

        <div className="mb-6 rounded bg-blue-50 p-4 text-sm text-blue-800">
          公開URL：
          <Link
            href={`/forms/${form.slug}`}
            className="ml-1 underline"
          >
            /forms/{form.slug}
          </Link>
        </div>

        <form action={addFormField} className="mb-8 space-y-4 rounded border p-4">
          <input type="hidden" name="form_id" value={formId} />

          <div>
            <label className="mb-1 block font-medium">
              質問名
            </label>
            <input
              type="text"
              name="label"
              required
              className="w-full rounded border p-2"
              placeholder="例：氏名"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              フィールド名
            </label>
            <input
              type="text"
              name="field_name"
              required
              className="w-full rounded border p-2"
              placeholder="例：name"
            />
            <p className="mt-1 text-sm text-gray-500">
              半角英数字とアンダースコアで入力してください。例：passport_number
            </p>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              入力タイプ
            </label>
            <select
              name="field_type"
              required
              className="w-full rounded border p-2"
            >
              <option value="text">1行テキスト</option>
              <option value="textarea">複数行テキスト</option>
              <option value="email">Email</option>
              <option value="date">日付</option>
              <option value="select">選択式</option>
              <option value="checkbox">チェックボックス</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              選択肢
            </label>
            <textarea
              name="options"
              className="h-20 w-full rounded border p-2"
              placeholder="選択式の場合のみ入力。例：男性,女性,その他"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="required" value="true" />
              <span>必須項目にする</span>
            </label>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              表示順
            </label>
            <input
              type="number"
              name="sort_order"
              defaultValue="0"
              className="w-full rounded border p-2"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            質問項目を追加
          </button>
        </form>

        <h2 className="mb-3 text-xl font-bold">
          現在の質問項目
        </h2>

        {fields && fields.length > 0 ? (
          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">表示順</th>
                <th className="border p-2">質問名</th>
                <th className="border p-2">フィールド名</th>
                <th className="border p-2">タイプ</th>
                <th className="border p-2">必須</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td className="border p-2">{field.sort_order}</td>
                  <td className="border p-2">{field.label}</td>
                  <td className="border p-2">{field.field_name}</td>
                  <td className="border p-2">{field.field_type}</td>
                  <td className="border p-2">
                    {field.required ? '必須' : '任意'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="rounded border p-4 text-gray-600">
            まだ質問項目はありません。
          </p>
        )}
      </div>
    </main>
  );
}