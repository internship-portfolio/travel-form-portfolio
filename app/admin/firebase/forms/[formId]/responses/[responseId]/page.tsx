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
    responseId: string;
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

export default function FirebaseFormResponseDetailPage({ params }: Props) {
  const { formId, responseId } = use(params);
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FirebaseForm | null>(null);
  const [fields, setFields] = useState<FirebaseField[]>([]);
  const [response, setResponse] = useState<FirebaseResponse | null>(null);
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

        const responseRef = doc(db, "responses", responseId);
        const responseSnapshot = await getDoc(responseRef);

        if (!responseSnapshot.exists()) {
          setErrorMessage("回答データが見つかりません。");
          setLoading(false);
          return;
        }

        const responseData = {
          id: responseSnapshot.id,
          ...responseSnapshot.data(),
        } as FirebaseResponse;

        if (responseData.formId !== formId) {
          setErrorMessage("このフォームに紐づく回答ではありません。");
          setLoading(false);
          return;
        }

        setResponse(responseData);

        const fieldsQuery = query(
          collection(db, "form_fields"),
          where("formId", "==", formId)
        );

        const fieldsSnapshot = await getDocs(fieldsQuery);

        const fieldsData: FirebaseField[] = fieldsSnapshot.docs
          .map((fieldDoc) => {
            const data = fieldDoc.data();

            return {
              id: fieldDoc.id,
              label: typeof data.label === "string" ? data.label : "",
              fieldName:
                typeof data.fieldName === "string" ? data.fieldName : "",
              fieldType:
                typeof data.fieldType === "string" ? data.fieldType : "text",
              options: typeof data.options === "string" ? data.options : "",
              required:
                typeof data.required === "boolean" ? data.required : false,
              sortOrder:
                typeof data.sortOrder === "number" ? data.sortOrder : 0,
            };
          })
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        setFields(fieldsData);

        const answersQuery = query(
          collection(db, "response_answers"),
          where("responseId", "==", responseId)
        );

        const answersSnapshot = await getDocs(answersQuery);

        const answersData: FirebaseAnswer[] = answersSnapshot.docs.map(
          (answerDoc) => {
            const data = answerDoc.data();

            return {
              id: answerDoc.id,
              responseId:
                typeof data.responseId === "string" ? data.responseId : "",
              formId: typeof data.formId === "string" ? data.formId : "",
              fieldId: typeof data.fieldId === "string" ? data.fieldId : "",
              value: typeof data.value === "string" ? data.value : "",
            };
          }
        );

        setAnswers(answersData);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setErrorMessage("回答詳細データの取得中にエラーが発生しました。");
        setCheckingAuth(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [formId, responseId, router]);

  function getAnswerValue(fieldId: string) {
    const answer = answers.find((item) => item.fieldId === fieldId);
    return answer?.value || "-";
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p>ログイン状態と回答詳細を確認中...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">{errorMessage}</p>

          <div className="mt-6">
            <Link
              href={`/admin/firebase/forms/${formId}/responses`}
              className="rounded border px-4 py-2 font-bold hover:bg-gray-100"
            >
              回答一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!form || !response) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">回答詳細が見つかりません。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">回答詳細</h1>

              <p className="mt-1 text-gray-600">
                {form.title} に送信された1件分の回答です。
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/firebase/forms/${formId}/responses`}
                className="rounded border px-4 py-2 font-bold hover:bg-gray-100"
              >
                回答一覧へ
              </Link>

              <Link
                href={`/admin/firebase/forms/${formId}/fields`}
                className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
              >
                質問項目編集
              </Link>
            </div>
          </div>

          <div className="rounded bg-blue-50 p-4 text-sm text-blue-800">
            <p>
              <span className="font-bold">送信日時：</span>
              {response.createdAt
                ? response.createdAt.toDate().toLocaleString("ja-JP")
                : "-"}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">回答内容</h2>

          {fields.length === 0 ? (
            <p className="rounded border p-4 text-gray-600">
              質問項目がありません。
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="rounded border p-4">
                  <div className="mb-2">
                    <p className="font-bold">{field.label || "無題の質問"}</p>

                    {field.fieldName && (
                      <p className="mt-1 text-xs text-gray-500">
                        管理用項目名：{field.fieldName}
                      </p>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap rounded bg-gray-50 p-3">
                    {getAnswerValue(field.id)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}