'use server';

import { redirect } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function createFirebaseForm(formData: FormData) {
  console.log('createFirebaseForm が呼ばれました');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;

  console.log('入力値:', {
    title,
    description,
    slug,
  });

  if (!title || !slug) {
    throw new Error('フォーム名と公開URL名は必須です');
  }

  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  let createdFormId = '';

  try {
    const docRef = await addDoc(collection(db, 'forms'), {
      title,
      description,
      slug: normalizedSlug,
      status: 'public',
      createdAt: serverTimestamp(),
    });

    createdFormId = docRef.id;

    console.log('Firestore保存成功:', createdFormId);
  } catch (error) {
    console.error('Firestore保存エラー:', error);
    throw new Error('Firestoreへの保存に失敗しました');
  }

  redirect(`/admin/firebase/forms/${createdFormId}/fields`);
}