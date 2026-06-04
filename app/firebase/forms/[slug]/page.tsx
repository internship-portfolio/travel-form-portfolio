import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { submitFirebaseResponse } from '@/app/actions/firebase/submitFirebaseResponse';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type FirebaseForm = {
  id: string;
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

export default async function FirebasePublicFormPage({ params }: Props) {
  const { slug } = await params;

  const formsQuery = query(
    collection(db, 'forms'),
    where('slug', '==', slug)
  );

  const formsSnapshot = await getDocs(formsQuery);

  if (formsSnapshot.empty) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">
            フォームが見つかりません。
          </p>
        </div>
      </main>
    );
  }

  const formDoc = formsSnapshot.docs[0];

  const form: FirebaseForm = {
    id: formDoc.id,
    ...formDoc.data(),
  };

  const fieldsQuery = query(
    collection(db, 'form_fields'),
    where('formId', '==', form.id)
  );

  const fieldsSnapshot = await getDocs(fieldsQuery);

  const fields: FirebaseField[] = fieldsSnapshot.docs
    .map((fieldDoc) => ({
      id: fieldDoc.id,
      ...fieldDoc.data(),
    }as FirebaseField))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          {form.title}
        </h1>

        <p className="mb-6 text-gray-600">
          {form.description}
        </p>

        {fields.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            このフォームにはまだ質問項目がありません。
          </p>
        ) : (
          <form action={submitFirebaseResponse} className="space-y-4">
            <input type="hidden" name="form_id" value={form.id} />

            {fields.map((field) => (
              <div key={field.id}>
                <label className="mb-1 block font-medium">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-600">*</span>
                  )}
                </label>

                <input type="hidden" name="field_ids" value={field.id} />

                {field.fieldType === 'textarea' ? (
                  <textarea
                    name={`field_${field.id}`}
                    required={field.required}
                    className="h-28 w-full rounded border p-2"
                  />
                ) : field.fieldType === 'select' ? (
                  <select
                    name={`field_${field.id}`}
                    required={field.required}
                    className="w-full rounded border p-2"
                  >
                    <option value="">選択してください</option>
                    {String(field.options || '')
                      .split(',')
                      .map((option) => option.trim())
                      .filter(Boolean)
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                ) : field.fieldType === 'checkbox' ? (
                  <label className="flex items-center gap-2 rounded border p-3">
                    <input
                      type="checkbox"
                      name={`field_${field.id}`}
                      value="true"
                      required={field.required}
                    />
                    <span>確認しました</span>
                  </label>
                ) : (
                  <input
                    type={field.fieldType || 'text'}
                    name={`field_${field.id}`}
                    required={field.required}
                    className="w-full rounded border p-2"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              送信する
            </button>
          </form>
        )}
      </div>
    </main>
  );
}