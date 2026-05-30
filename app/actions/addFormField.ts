'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function addFormField(formData: FormData) {
  const formId = formData.get('form_id') as string;
  const label = formData.get('label') as string;
  const fieldName = formData.get('field_name') as string;
  const fieldType = formData.get('field_type') as string;
  const options = formData.get('options') as string;
  const required = formData.get('required') === 'true';
  const sortOrder = Number(formData.get('sort_order') || 0);

  if (!formId || !label || !fieldName || !fieldType) {
    throw new Error('必要な項目が不足しています');
  }

  const normalizedFieldName = fieldName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const { error } = await supabase.from('form_fields').insert({
    form_id: formId,
    label,
    field_name: normalizedFieldName,
    field_type: fieldType,
    options,
    required,
    sort_order: sortOrder,
  });

  if (error) {
    console.error(error);
    throw new Error('質問項目の追加に失敗しました');
  }

  revalidatePath(`/admin/forms/${formId}/fields`);
}