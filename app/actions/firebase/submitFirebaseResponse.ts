"use server";

import { redirect } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { Resend } from "resend";

import { db } from "@/lib/firebase";

export async function submitFirebaseResponse(formData: FormData) {
  const formId = formData.get("form_id") as string;
  const fieldIds = formData.getAll("field_ids") as string[];

  if (!formId || fieldIds.length === 0) {
    throw new Error("フォーム情報が不足しています");
  }

  // --------------------------------------
  // 1. フォームが公開中か確認
  // --------------------------------------

  const formRef = doc(db, "forms", formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error("フォームが見つかりません。");
  }

  const formDocData = formSnap.data();

  if (formDocData.status !== "published") {
    throw new Error("このフォームは現在回答を受け付けていません。");
  }

  // --------------------------------------
  // 2. response用のIDを先に生成
  // --------------------------------------

  // この時点ではまだFirestoreには保存されない
  const responseRef = doc(collection(db, "responses"));

  // --------------------------------------
  // 3. responses + response_answersを
  //    同じbatchに入れる
  // --------------------------------------

  const batch = writeBatch(db);

  batch.set(responseRef, {
    formId,
    createdAt: serverTimestamp(),
  });

  fieldIds.forEach((fieldId) => {
    const value = String(formData.get(`field_${fieldId}`) ?? "");

    const answerRef = doc(collection(db, "response_answers"));

    batch.set(answerRef, {
      responseId: responseRef.id,
      formId,
      fieldId,
      value,
      createdAt: serverTimestamp(),
    });
  });

  // --------------------------------------
  // 4. 全回答を一括保存
  // --------------------------------------

  await batch.commit();

  // --------------------------------------
  // 5. 管理者へ通知メール
  // --------------------------------------

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!apiKey) {
      console.error("RESEND_API_KEYが設定されていません");
    } else if (!adminEmail) {
      console.error("ADMIN_EMAILが設定されていません");
    } else {
      const resend = new Resend(apiKey);

      const { data, error } = await resend.emails.send({
        from: "Travel System <onboarding@resend.dev>",

        to: [adminEmail],

        subject: "【新規旅行申請】新しい申請が届きました",

        text: `
新しい旅行申請が届きました。

フォーム名：
${formDocData.title ?? "名称未設定"}

申請ID：
${responseRef.id}

管理画面から申請内容をご確認ください。
        `,
      });

      if (error) {
        console.error("管理者メール送信エラー:", error);
      } else {
        console.log("管理者メール送信成功:", data?.id);
      }
    }
  } catch (error) {
    console.error("管理者メール通知処理でエラー:", error);
  }

  // --------------------------------------
  // 6. 完了画面
  // --------------------------------------

  redirect("/complete");
}