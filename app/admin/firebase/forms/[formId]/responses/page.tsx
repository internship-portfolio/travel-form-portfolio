import Link from 'next/link';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

type FirebaseResponse = {
  id: string;
  formId?: string;
  createdAt?: {
    toDate: () => Date;
  };
};

type FirebaseAnswer = {
  id: string;
  responseId?: string;
  formId?: string;
  fieldId?: string;
  value?: string;
};

export default async function FirebaseFormResponsesPage({ params }: Props) {
  const { formId } = await params;

  const formRef = doc(db, 'forms', formId);
  const formSnapshot = await getDoc(formRef);

  if (!formSnapshot.exists()) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">フォームが見つかりません。</p>
        </div>
      </main>
    );
  }

  const form = formSnapshot.data() as FirebaseForm;

  const fieldsQuery = query(
    collection(db, 'form_fields'),
    where('formId', '==', formId)
  );

  const fieldsSnapshot = await getDocs(fieldsQuery);

  const fields: FirebaseField[] = fieldsSnapshot.docs
    .map((fieldDoc) => ({
      id: fieldDoc.id,
      ...fieldDoc.data(),
    } as FirebaseField))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const responsesQuery = query(
    collection(db, 'responses'),
    where('formId', '==', formId)
  );

  const responsesSnapshot = await getDocs(responsesQuery);

  const responses: FirebaseResponse[] = responsesSnapshot.docs
    .map((responseDoc) => ({
      id: responseDoc.id,
      ...responseDoc.data(),
    } as FirebaseResponse))
    .sort((a, b) => {
      const aTime = a.createdAt?.toDate().getTime() ?? 0;
      const bTime = b.createdAt?.toDate().getTime() ?? 0;
      return bTime - aTime;
    });

  const answersQuery = query(
    collection(db, 'response_answers'),
    where('formId', '==', formId)
  );

  const answersSnapshot = await getDocs(answersQuery);

  const answers: FirebaseAnswer[] = answersSnapshot.docs.map((answerDoc) => ({
    id: answerDoc.id,
    ...answerDoc.data(),
  } as FirebaseAnswer));

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Firebase版 回答一覧
            </h1>

            <p className="mt-1 text-gray-600">
              {form.title} に送信された回答を確認できます。
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/firebase/forms"
              className="rounded border px-4 py-2 font-bold hover:bg-gray-100"
            >
              フォーム一覧へ
            </Link>

            <Link
              href={`/admin/firebase/forms/${formId}/fields`}
              className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
            >
              質問項目編集
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

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          回答件数：{responses.length} 件
        </div>

        {fields.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            このフォームには質問項目がありません。
          </p>
        ) : responses.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            まだ回答はありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">送信日時</th>
                  {fields.map((field) => (
                    <th key={field.id} className="border p-2">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {responses.map((response) => (
                  <tr key={response.id}>
                    <td className="border p-2">
                      {response.createdAt
                        ? response.createdAt.toDate().toLocaleString('ja-JP')
                        : '-'}
                    </td>

                    {fields.map((field) => {
                      const answer = answers.find(
                        (item) =>
                          item.responseId === response.id &&
                          item.fieldId === field.id
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