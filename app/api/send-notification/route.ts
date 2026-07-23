import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST() {
  try {
    console.log("STEP 1: POST処理開始");

    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    console.log(
      "RESEND_API_KEY:",
      apiKey ? "設定されています" : "未設定"
    );

    console.log(
      "ADMIN_EMAIL:",
      adminEmail ? "設定されています" : "未設定"
    );

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEYが設定されていません",
        },
        { status: 500 }
      );
    }

    if (!adminEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "ADMIN_EMAILが設定されていません",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    console.log("STEP 2: Resendへ送信開始");

    const { data, error } = await resend.emails.send({
      from: "Travel System <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "【テスト】旅行申請システムからのメール",
      text: `
これは旅行申請システムからのテストメールです。

Next.jsからResendを使用したメール送信に成功しました。
      `,
    });

    console.log("STEP 3: Resendから応答あり");

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      );
    }

    console.log("メール送信成功:", data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Send email error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "メール送信中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}