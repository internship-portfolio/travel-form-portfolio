'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export async function submitDynamicResponse(formData: FormData) {
  const formId = formData.get('form_id') as string;
  const fieldIds = formData.getAll('field_ids') as string[];

  if (!formId || fieldIds.length === 0) {
    throw new Error('フォーム情報が不足しています');
  }

  const { data: response, error: responseError } = await supabase
    .from('responses')
    .insert({
      form_id: formId,
      name: null,
      email: null,
      organization: null,
      message: null,
    })
    .select('id')
    .single();

  if (responseError || !response) {
    console.error(responseError);
    throw new Error('回答の作成に失敗しました');
  }

  const answers = fieldIds.map((fieldId) => ({
    response_id: response.id,
    field_id: fieldId,
    value: String(formData.get(`field_${fieldId}`) ?? ''),
  }));

  const { error: answersError } = await supabase
    .from('response_answers')
    .insert(answers);

  if (answersError) {
    console.error(answersError);
    throw new Error('回答内容の保存に失敗しました');
  }

  redirect('/complete');
}