import Link from 'next/link';//Nest.jsのページ遷移用のLink
import DeleteFieldButton from "./DeleteFieldButton";
//firestore関係
import {
  collection,//firestoreのコレクションを指定する
  doc,//firestoreの特定ドキュメントを指定
  getDoc,//ドキュメントを1件取得
  getDocs,//複数ドキュメントを取得
  orderBy,//並び替え
  query,//検索条件を作る
  where,//条件指定
} from 'firebase/firestore';
import { db } from '@/lib/firebase';//データベースオブジェクト
import AddFieldForm from "./AddFieldForm";//質問項目を追加する際に呼び出す関数

//params: Promise<{...}>
//今すぐ値があるとは限らないが後から値が返ってくる
type Props = {
  params: Promise<{
    formId: string;
  }>;
};

//formsコレクションから取得するフォーム情報の型を宣言
type FirebaseForm = {
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
};

//form_fieldsコレクションから取得する質問項目の型です
type FirebaseField = {
  id: string;
  label?: string;
  fieldName?: string;
  fieldType?: string;
  options?: string;
  required?: boolean;
  sortOrder?: number;
};

//ページ本体
//export default Next.jsはこの関数をページとして扱う
export default async function FirebaseFormFieldsPage({ params }: Props) {
  const { formId } = await params;//URLからformIdを取得

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

        <AddFieldForm formId={formId} />

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
                <th className="border p-2">操作</th>
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
                  <td className="border p-2 text-center">
                    <DeleteFieldButton
                      fieldId={field.id}
                      fieldLabel={field.label}
                    />
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