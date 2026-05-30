'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export async function submitResponse(formData: FormData) {
  const applicationDate = formData.get('application_date') as string;
  const representativeName = formData.get('representative_name') as string;
  const guardianSignature = formData.get('guardian_signature') as string;
  const passportNameAlphabet = formData.get('passport_name_alphabet') as string;
  const birthDate = formData.get('birth_date') as string;
  const gender = formData.get('gender') as string;
  const nationality = formData.get('nationality') as string;
  const passportNumber = formData.get('passport_number') as string;
  const passportExpiryDate = formData.get('passport_expiry_date') as string;
  const visaStatus = formData.get('visa_status') as string;
  const addressFurigana = formData.get('address_furigana') as string;
  const contact = formData.get('contact') as string;
  const email = formData.get('email') as string;
  const emergencyContactName = formData.get('emergency_contact_name') as string;
  const emergencyContactRelationship = formData.get(
    'emergency_contact_relationship'
  ) as string;
  const emergencyContactPhone = formData.get('emergency_contact_phone') as string;
  const travelInsurance = formData.get('travel_insurance') as string;
  const privacyPolicyConfirmed =
    formData.get('privacy_policy_confirmed') === 'true';

  if (
    !applicationDate ||
    !representativeName ||
    !passportNameAlphabet ||
    !birthDate ||
    !gender ||
    !nationality ||
    !passportNumber ||
    !passportExpiryDate ||
    !addressFurigana ||
    !contact ||
    !email ||
    !emergencyContactName ||
    !emergencyContactRelationship ||
    !emergencyContactPhone ||
    !travelInsurance ||
    !privacyPolicyConfirmed
  ) {
    throw new Error('必須項目が入力されていません');
  }

  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('title', 'サンプル受付フォーム')
    .single();

  if (formError || !form) {
    console.error(formError);
    throw new Error('フォーム情報が見つかりません');
  }

  const { error } = await supabase.from('responses').insert({
    form_id: form.id,

    // 既存列にも最低限入れておく
    name: representativeName,
    email,
    organization: '',
    message: '',

    // 旅行申込フォーム用の列
    application_date: applicationDate,
    representative_name: representativeName,
    guardian_signature: guardianSignature,
    passport_name_alphabet: passportNameAlphabet,
    birth_date: birthDate,
    gender,
    nationality,
    passport_number: passportNumber,
    passport_expiry_date: passportExpiryDate,
    visa_status: visaStatus,
    address_furigana: addressFurigana,
    contact,
    emergency_contact_name: emergencyContactName,
    emergency_contact_relationship: emergencyContactRelationship,
    emergency_contact_phone: emergencyContactPhone,
    travel_insurance: travelInsurance,
    privacy_policy_confirmed: privacyPolicyConfirmed,
  });

  if (error) {
    console.error(error);
    throw new Error('回答の保存に失敗しました');
  }

  redirect('/complete');
}