'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function addFirebaseFormField(formData: FormData) {
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

  await addDoc(collection(db, 'form_fields'), {
    formId,
    label,
    fieldName: normalizedFieldName,
    fieldType,
    options,
    required,
    sortOrder,
    createdAt: serverTimestamp(),
  });

  revalidatePath(`/admin/firebase/forms/${formId}/fields`);
}