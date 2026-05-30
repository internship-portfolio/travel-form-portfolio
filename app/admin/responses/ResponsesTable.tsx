'use client';

import { useMemo, useState } from 'react';

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

export default function ResponsesTable({ responses }: Props) {
  const [keyword, setKeyword] = useState('');

  const filteredResponses = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    if (!searchText) {
      return responses;
    }

    return responses.filter((response) => {
      const targetText = [
        response.representative_name,
        response.passport_name_alphabet,
        response.nationality,
        response.passport_number,
        response.email,
        response.contact,
        response.emergency_contact_name,
      ]
        .join(' ')
        .toLowerCase();

      return targetText.includes(searchText);
    });
  }, [keyword, responses]);

  return (
    <div>
      <div className="mb-4">
        <label className="mb-1 block font-medium">
          回答検索
        </label>

        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="w-full rounded border p-2"
          placeholder="代表者氏名、パスポート名、国籍、Emailなどで検索"
        />
      </div>

      <div className="mb-4 rounded bg-gray-50 p-3 text-sm text-gray-700">
        表示件数：{filteredResponses.length} 件 / 全{responses.length} 件
      </div>

      {filteredResponses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px] border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">送信日時</th>
                <th className="border p-2">申込日</th>
                <th className="border p-2">契約代表者氏名</th>
                <th className="border p-2">親権者同意サイン</th>
                <th className="border p-2">パスポート名</th>
                <th className="border p-2">生年月日</th>
                <th className="border p-2">性別</th>
                <th className="border p-2">国籍</th>
                <th className="border p-2">パスポート番号</th>
                <th className="border p-2">有効期限</th>
                <th className="border p-2">ビザ取得状況</th>
                <th className="border p-2">住所（フリガナ）</th>
                <th className="border p-2">連絡先</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">旅行中の連絡者</th>
                <th className="border p-2">続柄</th>
                <th className="border p-2">旅行中の連絡先</th>
                <th className="border p-2">旅行保険</th>
                <th className="border p-2">個人情報確認</th>
              </tr>
            </thead>

            <tbody>
              {filteredResponses.map((response) => (
                <tr key={response.id}>
                  <td className="border p-2">
                    {new Date(response.created_at).toLocaleString('ja-JP')}
                  </td>
                  <td className="border p-2">{response.application_date || '-'}</td>
                  <td className="border p-2">{response.representative_name || '-'}</td>
                  <td className="border p-2">{response.guardian_signature || '-'}</td>
                  <td className="border p-2">{response.passport_name_alphabet || '-'}</td>
                  <td className="border p-2">{response.birth_date || '-'}</td>
                  <td className="border p-2">{response.gender || '-'}</td>
                  <td className="border p-2">{response.nationality || '-'}</td>
                  <td className="border p-2">{response.passport_number || '-'}</td>
                  <td className="border p-2">{response.passport_expiry_date || '-'}</td>
                  <td className="border p-2">{response.visa_status || '-'}</td>
                  <td className="border p-2">{response.address_furigana || '-'}</td>
                  <td className="border p-2">{response.contact || '-'}</td>
                  <td className="border p-2">{response.email || '-'}</td>
                  <td className="border p-2">{response.emergency_contact_name || '-'}</td>
                  <td className="border p-2">
                    {response.emergency_contact_relationship || '-'}
                  </td>
                  <td className="border p-2">{response.emergency_contact_phone || '-'}</td>
                  <td className="border p-2">{response.travel_insurance || '-'}</td>
                  <td className="border p-2">
                    {response.privacy_policy_confirmed ? '確認済み' : '未確認'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded border p-4 text-gray-600">
          条件に一致する回答はありません。
        </p>
      )}
    </div>
  );
}