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

/**
 * 簡易的なメールアドレス形式チェック
 */
function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  // 4. 申請者のメールアドレスを取得
  // ==================================================

  /*
   * 現在のフォームでは
   *
   * label: "Email Address"
   *
   * となっているため、Labelを使って該当回答を探す。
   */
  const applicantEmail =
    submittedAnswers
      .find(
        (answer) =>
          answer.label.trim().toLowerCase() === "email address"
      )
      ?.value.trim() ?? "";

  if (!applicantEmail) {
    throw new Error(
      "申請者のメールアドレスが入力されていません。"
    );
  }

  if (!isValidEmail(applicantEmail)) {
    throw new Error(
      "申請者のメールアドレスの形式が正しくありません。"
    );
  }

  // ==================================================
  // 5. response IDを先に生成
  // ==================================================

  const responseRef = doc(collection(db, "responses"));

  const batch = writeBatch(db);

  batch.set(responseRef, {
    formId,
    createdAt: serverTimestamp(),
  });

  // ==================================================
  // 6. 全回答を response_answers へ保存
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
  // 7. 共通情報
  // ==================================================

  const submittedAt = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Tokyo",
  }).format(new Date());

  const formTitle = String(
    formDocData.title ?? "名称未設定"
  );

  // ==================================================
  // 8. 管理者向けメール本文
  // ==================================================

  const answersText = submittedAnswers
    .map((answer) => {
      return `${answer.label}
${answer.value || "未入力"}`;
    })
    .join("\n\n------------------------------\n\n");

  const adminTextBody = `
新しい旅行申請が届きました。

================================
申請情報
================================

フォーム名：
${formTitle}

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

  const answersHtml = submittedAnswers
    .map((answer) => {
      const label = escapeHtml(answer.label);

      const value = escapeHtml(
        answer.value || "未入力"
      ).replaceAll("\n", "<br>");

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

  const adminHtmlBody = `
<!DOCTYPE html>
<html lang="ja">
  <body style="font-family:Arial, sans-serif; line-height:1.6;">
    <h2>新しい旅行申請が届きました</h2>

    <p>
      <strong>フォーム名：</strong>
      ${escapeHtml(formTitle)}
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
  // 9. 申請者向け確認メール本文
  // ==================================================

  /*
   * パスポート番号等の個人情報をメールへ再掲載せず、
   * 受付確認に必要な最低限の情報だけを送る。
   */
  const applicantTextBody = `
旅行申請システムをご利用いただきありがとうございます。

旅行申請を受け付けました。

================================
申請情報
================================

フォーム名：
${formTitle}

申請日時：
${submittedAt}

申請ID：
${responseRef.id}

================================

申請内容を確認後、担当者よりご連絡いたします。

このメールは自動送信されています。
`;

  const applicantHtmlBody = `
<!DOCTYPE html>
<html lang="ja">
  <body
    style="
      font-family:Arial, sans-serif;
      line-height:1.7;
      color:#222222;
    "
  >
    <div
      style="
        max-width:650px;
        margin:0 auto;
        padding:24px;
      "
    >
      <h2>旅行申請を受け付けました</h2>

      <p>
        旅行申請システムをご利用いただきありがとうございます。
      </p>

      <p>
        以下の旅行申請を受け付けました。
      </p>

      <table
        style="
          border-collapse:collapse;
          width:100%;
          margin-top:20px;
        "
      >
        <tr>
          <th
            style="
              text-align:left;
              padding:10px;
              border:1px solid #cccccc;
              background:#f5f5f5;
              width:30%;
            "
          >
            フォーム名
          </th>

          <td
            style="
              padding:10px;
              border:1px solid #cccccc;
            "
          >
            ${escapeHtml(formTitle)}
          </td>
        </tr>

        <tr>
          <th
            style="
              text-align:left;
              padding:10px;
              border:1px solid #cccccc;
              background:#f5f5f5;
            "
          >
            申請日時
          </th>

          <td
            style="
              padding:10px;
              border:1px solid #cccccc;
            "
          >
            ${escapeHtml(submittedAt)}
          </td>
        </tr>

        <tr>
          <th
            style="
              text-align:left;
              padding:10px;
              border:1px solid #cccccc;
              background:#f5f5f5;
            "
          >
            申請ID
          </th>

          <td
            style="
              padding:10px;
              border:1px solid #cccccc;
            "
          >
            ${escapeHtml(responseRef.id)}
          </td>
        </tr>
      </table>

      <p style="margin-top:24px;">
        申請内容を確認後、担当者よりご連絡いたします。
      </p>

      <p
        style="
          margin-top:30px;
          color:#666666;
          font-size:13px;
        "
      >
        このメールは自動送信されています。
      </p>
    </div>
  </body>
</html>
`;

  // ==================================================
  // 10. Resendでメール送信
  // ==================================================

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      console.error(
        "RESEND_API_KEYが設定されていません"
      );
    } else if (!adminEmail) {
      console.error(
        "ADMIN_EMAILが設定されていません"
      );
    } else if (!fromEmail) {
      console.error(
        "RESEND_FROM_EMAILが設定されていません"
      );
    } else {
      const resend = new Resend(apiKey);

      // ================================================
      // 10-1. 管理者へ通知
      // ================================================

      const {
        data: adminMailData,
        error: adminMailError,
      } = await resend.emails.send({
        from: `Travel System <${fromEmail}>`,

        to: [adminEmail],

        subject:
          "【新規旅行申請】申請内容を受信しました",

        text: adminTextBody,

        html: adminHtmlBody,
      });

      if (adminMailError) {
        console.error(
          "管理者メール送信エラー:",
          adminMailError
        );
      } else {
        console.log(
          "管理者メール送信成功:",
          adminMailData?.id
        );
      }

      // ================================================
      // 10-2. 申請者へ受付確認メール
      // ================================================

      const {
        data: applicantMailData,
        error: applicantMailError,
      } = await resend.emails.send({
        from: `Travel System <${fromEmail}>`,

        to: [applicantEmail],

        subject:
          "【旅行申請システム】旅行申請を受け付けました",

        text: applicantTextBody,

        html: applicantHtmlBody,
      });

      if (applicantMailError) {
        console.error(
          "申請者確認メール送信エラー:",
          applicantMailError
        );
      } else {
        console.log(
          "申請者確認メール送信成功:",
          applicantMailData?.id
        );
      }
    }
  } catch (error) {
    console.error(
      "メール通知処理でエラー:",
      error
    );
  }

  // ==================================================
  // 11. 完了ページへ
  // ==================================================

  redirect("/complete");
}