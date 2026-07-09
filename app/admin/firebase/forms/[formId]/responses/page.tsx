"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Props = {
  params: Promise<{
    formId: string;
  }>;
};

type FirebaseForm = {
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
};

type FirebaseField = {
  id: string;
  label?: string;
  fieldName?: string;
  fieldType?: string;
  options?: string;
  required?: boolean;
  sortOrder?: number;
};

type FirebaseResponse = {
  id: string;
  formId?: string;
  createdAt?: {
    toDate: () => Date;
  };
};

type FirebaseAnswer = {
  id: string;
  responseId?: string;
  formId?: string;
  fieldId?: string;
  value?: string;
};

export default function FirebaseFormResponsesPage({ params }: Props) {
  const { formId } = use(params);
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FirebaseForm | null>(null);
  const [fields, setFields] = useState<FirebaseField[]>([]);
  const [responses, setResponses] = useState<FirebaseResponse[]>([]);
  const [answers, setAnswers] = useState<FirebaseAnswer[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const tokenResult = await currentUser.getIdTokenResult(true);
        

        console.log("ログインユーザー:", currentUser.email);
        console.log("UID:", currentUser.uid);
        console.log("claims:", tokenResult.claims);

        if (tokenResult.claims.admin !== true) {
          alert("管理者権限がありません");
          router.push("/login");
          return;
        }

        setCheckingAuth(false);

        const formRef = doc(db, "forms", formId);
        const formSnapshot = await getDoc(formRef);

        if (!formSnapshot.exists()) {
          setErrorMessage("フォームが見つかりません。");
          setLoading(false);
          return;
        }

        setForm(formSnapshot.data() as FirebaseForm);

        const fieldsQuery = query(
          collection(db, "form_fields"),
          where("formId", "==", formId)
        );

        const fieldsSnapshot = await getDocs(fieldsQuery);

        const fieldsData: FirebaseField[] = fieldsSnapshot.docs
          .map((fieldDoc) => ({
            id: fieldDoc.id,
            ...fieldDoc.data(),
          } as FirebaseField))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        setFields(fieldsData);

        const responsesQuery = query(
          collection(db, "responses"),
          where("formId", "==", formId)
        );

        const responsesSnapshot = await getDocs(responsesQuery);

        const responsesData: FirebaseResponse[] = responsesSnapshot.docs
          .map((responseDoc) => ({
            id: responseDoc.id,
            ...responseDoc.data(),
          } as FirebaseResponse))
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate().getTime() ?? 0;
            const bTime = b.createdAt?.toDate().getTime() ?? 0;
            return bTime - aTime;
          });

        setResponses(responsesData);

        const answersQuery = query(
          collection(db, "response_answers"),
          where("formId", "==", formId)
        );

        const answersSnapshot = await getDocs(answersQuery);

        const answersData: FirebaseAnswer[] = answersSnapshot.docs.map(
          (answerDoc) => ({
            id: answerDoc.id,
            ...answerDoc.data(),
          } as FirebaseAnswer)
        );

        setAnswers(answersData);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setErrorMessage("回答データの取得中にエラーが発生しました。");
        setCheckingAuth(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [formId, router]);

  function getAnswerValue(responseId: string, fieldId: string) {
    const answer = answers.find(
      (item) => item.responseId === responseId && item.fieldId === fieldId
    );

    return answer?.value ?? "";
  }

  function escapeCsvValue(value: string) {
    const escapedValue = value.replace(/"/g, '""');

    return `"${escapedValue}"`;
  }

  function handleDownloadCsv() {
    if (responses.length === 0) {
      alert("ダウンロードできる回答がありません。");
      return;
    }

    const header = [
      "Submitted At",
      ...fields.map((field) => field.label || field.fieldName || field.id),
    ];

    const rows = responses.map((response) => {
      const submittedAt = response.createdAt
        ? response.createdAt.toDate().toLocaleString("ja-JP")
        : "";

      return [
        submittedAt,
        ...fields.map((field) => getAnswerValue(response.id, field.id)),
      ];
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(String(value))).join(","))
      .join("\r\n");

    // Excelで文字化けしにくいようにBOMを付ける
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const fileNameBase = form?.title
      ? form.title.replace(/[\\/:*?"<>|]/g, "_")
      : "responses";

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileNameBase}_responses.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p>ログイン状態と回答データを確認中...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">フォームが見つかりません。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Firebase版 回答一覧</h1>

            <p className="mt-1 text-gray-600">
              {form.title} に送信された回答を確認できます。
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={responses.length === 0}
              className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              CSVダウンロード
            </button>
            
            <Link
              href="/admin/firebase/forms"
              className="rounded border px-4 py-2 font-bold hover:bg-gray-100"
            >
              フォーム一覧へ
            </Link>

            <Link
              href={`/admin/firebase/forms/${formId}/fields`}
              className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
            >
              質問項目編集
            </Link>

            {form.slug && (
              <Link
                href={`/firebase/forms/${form.slug}`}
                className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                公開フォーム
              </Link>
            )}
          </div>
        </div>

        <div className="mb-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
          回答件数：{responses.length} 件
        </div>

        {fields.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            このフォームには質問項目がありません。
          </p>
        ) : responses.length === 0 ? (
          <p className="rounded border p-4 text-gray-600">
            まだ回答はありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">送信日時</th>
                  {fields.map((field) => (
                    <th key={field.id} className="border p-2">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {responses.map((response) => (
                  <tr key={response.id}>
                    <td className="border p-2">
                      {response.createdAt
                        ? response.createdAt.toDate().toLocaleString("ja-JP")
                        : "-"}
                    </td>

                    {fields.map((field) => {
                      const answer = answers.find(
                        (item) =>
                          item.responseId === response.id &&
                          item.fieldId === field.id
                      );

                      return (
                        <td key={field.id} className="border p-2">
                          {answer?.value || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}