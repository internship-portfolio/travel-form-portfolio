import { supabase } from "@/lib/supabase";
import CsvDownloadButton from './CsvDownloadButton';
import ResponsesTable from './ResponsesTable';

export default async function AdminResponsesPage() {
  const { data: responses, error } = await supabase
    .from("responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-bold">
            旅行申込一覧
          </h1>

          <p className="mb-6 text-gray-600">
            旅行申込フォームから送信された内容を一覧で確認できます。
          </p>
        </div>
      </main>
    );
  }

  const responseList = responses ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          回答一覧
        </h1>

        <p className="mb-6 text-gray-600">
          公開フォームから送信された回答を一覧で確認できます。
        </p>

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          現在の回答件数：{responseList.length} 件
        </div>

        <CsvDownloadButton responses={responseList} />

        <ResponsesTable responses={responseList} />
      </div>
    </main>
  );
}