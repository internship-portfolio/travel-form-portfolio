import { supabase } from '@/lib/supabase';
import { submitDynamicResponse } from '@/app/actions/submitDynamicResponse';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicDynamicFormPage({ params }: Props) {
  const { slug } = await params;

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!form) {
    return (
      <main className="p-6">
        <p>フォームが見つかりません。</p>
      </main>
    );
  }

  const { data: fields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', form.id)
    .order('sort_order', { ascending: true });

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          {form.title}
        </h1>

        <p className="mb-6 text-gray-600">
          {form.description}
        </p>

        <form action={submitDynamicResponse} className="space-y-4">
          <input type="hidden" name="form_id" value={form.id} />

          {fields?.map((field) => (
            <div key={field.id}>
              <label className="mb-1 block font-medium">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-600">*</span>
                )}
              </label>

              <input type="hidden" name="field_ids" value={field.id} />

              {field.field_type === 'textarea' ? (
                <textarea
                  name={`field_${field.id}`}
                  required={field.required}
                  className="h-28 w-full rounded border p-2"
                />
              ) : field.field_type === 'select' ? (
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
              ) : field.field_type === 'checkbox' ? (
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
                  type={field.field_type}
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
      </div>
    </main>
  );
}