"use server";

import { redirect } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { Resend } from "resend";

import { db } from "@/lib/firebase";

/**
 * HTMLメールにユーザー入力をそのまま埋め込まないためのエスケープ処理
 */
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * FormDataの値を文字列へ変換
 * checkbox等で複数値があれば「, 」で連結する
 */
function getFormValue(formData: FormData, fieldId: string) {
  const values = formData.getAll(`field_${fieldId}`);

  return values
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      // Fileが来た場合
      return value.name ? `[ファイル: ${value.name}]` : "[ファイル]";
    })
    .join(", ");
}

export async function submitFirebaseResponse(formData: FormData) {
  const formId = formData.get("form_id") as string;
  const fieldIds = formData.getAll("field_ids") as string[];

  if (!formId || fieldIds.length === 0) {
    throw new Error("フォーム情報が不足しています");
  }

  // ==================================================
  // 1. フォーム情報を取得
  // ==================================================

  const formRef = doc(db, "forms", formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error("フォームが見つかりません。");
  }

  const formDocData = formSnap.data();

  if (formDocData.status !== "published") {
    throw new Error("このフォームは現在回答を受け付けていません。");
  }

  // ==================================================
  // 2. form_fields を取得
  // ==================================================

  const fieldsQuery = query(
    collection(db, "form_fields"),
    where("formId", "==", formId)
  );

  const fieldsSnapshot = await getDocs(fieldsQuery);

  // fieldId → label の対応表
  const fieldLabelMap = new Map<string, string>();

  fieldsSnapshot.forEach((fieldDoc) => {
    const data = fieldDoc.data();

    fieldLabelMap.set(
      fieldDoc.id,
      String(data.label ?? data.fieldName ?? fieldDoc.id)
    );
  });

  // ==================================================
  // 3. 今回送信された全回答をまとめる
  // ==================================================

  const submittedAnswers = fieldIds.map((fieldId) => {
    const value = getFormValue(formData, fieldId);

    return {
      fieldId,
      label: fieldLabelMap.get(fieldId) ?? fieldId,
      value,
    };
  });

  // ==================================================
  // 4. response IDを先に生成
  // ==================================================

  const responseRef = doc(collection(db, "responses"));

  const batch = writeBatch(db);

  batch.set(responseRef, {
    formId,
    createdAt: serverTimestamp(),
  });

  // ==================================================
  // 5. 全回答を response_answers へ保存
  // ==================================================

  submittedAnswers.forEach((answer) => {
    const answerRef = doc(collection(db, "response_answers"));

    batch.set(answerRef, {
      responseId: responseRef.id,
      formId,
      fieldId: answer.fieldId,
      value: answer.value,
      createdAt: serverTimestamp(),
    });
  });

  // responses と answers を一括保存
  await batch.commit();

  // ==================================================
  // 6. メール本文作成
  // ==================================================

  const submittedAt = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Tokyo",
  }).format(new Date());

  // プレーンテキスト版
  const answersText = submittedAnswers
    .map((answer) => {
      return `${answer.label}
${answer.value || "未入力"}`;
    })
    .join("\n\n------------------------------\n\n");

  const textBody = `
新しい旅行申請が届きました。

================================
申請情報
================================

フォーム名：
${formDocData.title ?? "名称未設定"}

申請日時：
${submittedAt}

申請ID：
${responseRef.id}

================================
回答内容
================================

${answersText}

================================
以上
================================
`;

  // HTML版
  const answersHtml = submittedAnswers
    .map((answer) => {
      const label = escapeHtml(answer.label);
      const value = escapeHtml(answer.value || "未入力").replaceAll(
        "\n",
        "<br>"
      );

      return `
        <tr>
          <th
            style="
              text-align:left;
              vertical-align:top;
              padding:10px;
              border:1px solid #cccccc;
              background:#f5f5f5;
              width:35%;
            "
          >
            ${label}
          </th>

          <td
            style="
              padding:10px;
              border:1px solid #cccccc;
            "
          >
            ${value}
          </td>
        </tr>
      `;
    })
    .join("");

  const htmlBody = `
<!DOCTYPE html>
<html lang="ja">
  <body style="font-family:Arial, sans-serif; line-height:1.6;">
    <h2>新しい旅行申請が届きました</h2>

    <p>
      <strong>フォーム名：</strong>
      ${escapeHtml(String(formDocData.title ?? "名称未設定"))}
    </p>

    <p>
      <strong>申請日時：</strong>
      ${escapeHtml(submittedAt)}
    </p>

    <p>
      <strong>申請ID：</strong>
      ${escapeHtml(responseRef.id)}
    </p>

    <h3>申請内容</h3>

    <table
      style="
        border-collapse:collapse;
        width:100%;
        max-width:900px;
      "
    >
      ${answersHtml}
    </table>
  </body>
</html>
`;

  // ==================================================
  // 7. Resendで管理者へ送信
  // ==================================================

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      console.error("RESEND_API_KEYが設定されていません");
    } else if (!adminEmail) {
      console.error("ADMIN_EMAILが設定されていません");
    } else if (!fromEmail) {
      console.error("RESEND_FROM_EMAILが設定されていません");
    }else {
      const resend = new Resend(apiKey);

      const { data, error } = await resend.emails.send({
        from: `Travel System <${fromEmail}>`,

        to: [adminEmail],

        subject: "【新規旅行申請】申請内容を受信しました",

        text: textBody,

        html: htmlBody,
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

  // ==================================================
  // 8. 完了ページへ
  // ==================================================

  redirect("/complete");
}