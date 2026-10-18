import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

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

    const { data, error } = await resend.emails.send({
      from: "Travel System <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "【テスト】旅行申請システムからのメール",
      text: `
これは旅行申請システムからのテストメールです。

Next.jsからResendを使用したメール送信に成功しました。
      `,
    });

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