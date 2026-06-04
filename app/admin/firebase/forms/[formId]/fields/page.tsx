import Link from 'next/link';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addFirebaseFormField } from '@/app/actions/firebase/addFirebaseFormField';

type Props = {
  params: Promise<{
    formId: string;
  }>;
};

type FirebaseForm = {
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
};

type FirebaseField = {
  id: string;
  label?: string;
  fieldName?: string;
  fieldType?: string;
  options?: string;
  required?: boolean;
  sortOrder?: number;
};

export default async function FirebaseFormFieldsPage({ params }: Props) {
  const { formId } = await params;

  const formRef = doc(db, 'forms', formId);
  const formSnapshot = await getDoc(formRef);

  if (!formSnapshot.exists()) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">フォームが見つかりません。</p>
        </div>
      </main>
    );
  }

  const form = formSnapshot.data() as FirebaseForm;

  const fieldsQuery = query(
    collection(db, 'form_fields'),
    where('formId', '==', formId),
    orderBy('sortOrder', 'asc')
  );

  const fieldsSnapshot = await getDocs(fieldsQuery);

  const fields: FirebaseField[] = fieldsSnapshot.docs.map((fieldDoc) => ({
    id: fieldDoc.id,
    ...fieldDoc.data(),
  }));

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Firebase版 質問項目編集</h1>
            <p className="mt-1 text-gray-600">{form.title}</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/firebase/forms"
              className="rounded border px-4 py-2 font-bold hover:bg-gray-100"
            >
              フォーム一覧へ
            </Link>

            {form.slug && (
              <Link
                href={`/firebase/forms/${form.slug}`}
                className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                公開フォーム
              </Link>
            )}
          </div>
        </div>

        {form.slug && (
          <div className="mb-6 rounded bg-blue-50 p-4 text-sm text-blue-800">
            公開URL：
            <span className="ml-1 font-bold">/firebase/forms/{form.slug}</span>
          </div>
        )}

        <form
          action={addFirebaseFormField}
          className="mb-8 space-y-4 rounded border p-4"
        >
          <input type="hidden" name="form_id" value={formId} />

          <div>
            <label className="mb-1 block font-medium">質問名</label>
            <input
              type="text"
              name="label"
              required
              className="w-full rounded border p-2"
              placeholder="例：氏名"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">フィールド名</label>
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
            <label className="mb-1 block font-medium">入力タイプ</label>
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
            <label className="mb-1 block font-medium">選択肢</label>
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
            <label className="mb-1 block font-medium">表示順</label>
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

        <h2 className="mb-3 text-xl font-bold">現在の質問項目</h2>

        {fields.length > 0 ? (
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
                  <td className="border p-2">{field.sortOrder ?? 0}</td>
                  <td className="border p-2">{field.label}</td>
                  <td className="border p-2">{field.fieldName}</td>
                  <td className="border p-2">{field.fieldType}</td>
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