'use client';

type ResponseData = {
  id: string;
  created_at: string;
  application_date: string | null;
  representative_name: string | null;
  guardian_signature: string | null;
  passport_name_alphabet: string | null;
  birth_date: string | null;
  gender: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  visa_status: string | null;
  address_furigana: string | null;
  contact: string | null;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
  travel_insurance: string | null;
  privacy_policy_confirmed: boolean | null;
};

type Props = {
  responses: ResponseData[];
};

export default function CsvDownloadButton({ responses }: Props) {
  const downloadCsv = () => {
    const header = [
      '送信日時',
      '申込日',
      '契約代表者氏名',
      '親権者同意サイン',
      '氏名（パスポート名アルファベット）',
      '生年月日',
      '性別',
      '国籍',
      'パスポート番号',
      '有効期限',
      'ビザ取得状況',
      '住所（フリガナ）',
      '連絡先',
      'Email',
      '旅行中の連絡者氏名',
      '旅行中の連絡者本人との続柄',
      '旅行中の連絡先 電話番号等',
      '旅行保険の加入の有無',
      '個人情報の取り扱い確認',
    ];

    const rows = responses.map((response) => [
      new Date(response.created_at).toLocaleString('ja-JP'),
      response.application_date ?? '',
      response.representative_name ?? '',
      response.guardian_signature ?? '',
      response.passport_name_alphabet ?? '',
      response.birth_date ?? '',
      response.gender ?? '',
      response.nationality ?? '',
      response.passport_number ?? '',
      response.passport_expiry_date ?? '',
      response.visa_status ?? '',
      response.address_furigana ?? '',
      response.contact ?? '',
      response.email ?? '',
      response.emergency_contact_name ?? '',
      response.emergency_contact_relationship ?? '',
      response.emergency_contact_phone ?? '',
      response.travel_insurance ?? '',
      response.privacy_policy_confirmed ? '確認済み' : '未確認',
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'travel_applications.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={downloadCsv}
      disabled={responses.length === 0}
      className="mb-4 rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      CSV出力
    </button>
  );
}