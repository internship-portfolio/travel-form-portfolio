import Link from 'next/link';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FirebaseForm = {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
  createdAt?: {
    toDate: () => Date;
  };
};

export default async function FirebaseFormsPage() {
  const formsQuery = query(
    collection(db, 'forms'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(formsQuery);

  const forms: FirebaseForm[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Firebase版フォーム一覧
            </h1>
            <p className="mt-1 text-gray-600">
              Firestoreに保存されたフォームを一覧表示します。
            </p>
          </div>

          <Link
            href="/admin/firebase/forms/new"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            新規フォーム作成
          </Link>
        </div>

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          作成済みフォーム数：{forms.length} 件
        </div>

        {forms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">フォーム名</th>
                  <th className="border p-2">説明</th>
                  <th className="border p-2">公開URL</th>
                  <th className="border p-2">状態</th>
                  <th className="border p-2">作成日時</th>
                </tr>
              </thead>

              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td className="border p-2 font-medium">
                      {form.title || '-'}
                    </td>

                    <td className="border p-2">
                      {form.description || '-'}
                    </td>

                    <td className="border p-2">
                      {form.slug ? (
                        
                        <Link
                          href={`/firebase/forms/${form.slug}`}
                          className="text-blue-600 underline"
                        >
                          /firebase/forms/{form.slug}
                        </Link>
                      ) : (
                        <span className="text-gray-500">未設定</span>
                      )}
                    </td>

                    <td className="border p-2">
                      {form.status || '-'}
                    </td>

                    <td className="border p-2">
                      {form.createdAt
                        ? form.createdAt.toDate().toLocaleString('ja-JP')
                        : '-'}
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