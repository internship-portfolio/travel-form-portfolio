'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export async function createForm(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;

  if (!title || !slug) {
    throw new Error('フォーム名と公開URL名は必須です');
  }

  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from('forms')
    .insert({
      title,
      description,
      slug: normalizedSlug,
      status: 'public',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase create form error:', error);
    throw new Error(`フォームの作成に失敗しました: ${error.message}`);
  }

  if (!data) {
    throw new Error('フォームの作成に失敗しました: 作成データが取得できませんでした');
  }

  redirect(`/admin/forms/${data.id}/fields`);
}