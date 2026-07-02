"use server"; // サーバ側で実行することを明示

import { redirect } from "next/navigation"; // リダイレクト機能の読み込み
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore"; // Firebase関連の関数読み込み
import { db } from "@/lib/firebase"; // Firestoreに接続するためのオブジェクト

/*
  createFirebaseForm関数を定義
  export: 他のファイルから使用可能な関数
  async: 非同期処理
  FormData: フォームから送信されたデータを受け取る
*/
export async function createFirebaseForm(formData: FormData) {
  console.log("createFirebaseForm が呼ばれました");

  // フォームから送信されたデータを文字列として取得
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;

  console.log("入力値:", {
    title,
    description,
    slug,
  });

  // title、slugが未入力の場合エラーを出力
  if (!title || !slug) {
    throw new Error("フォーム名と公開URL名は必須です");
  }

  /*
    slugをURLで使用できる形に整形する
    trim(): 前後の空白削除
    toLowerCase(): 小文字化
    replace(/\s+/g, "-"): 空白をハイフンに変換
    replace(/[^a-z0-9-]/g, ""): 英小文字・数字・ハイフン以外を削除
    replace(/-+/g, "-"): ハイフンの連続を1つにする
    replace(/^-|-$/g, ""): 先頭・末尾のハイフンを削除
  */
  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalizedSlug) {
    throw new Error("公開URL名には英数字またはハイフンを使用してください");
  }

  /*
    slugの重複確認
    同じslugのフォームがすでに存在する場合は作成しない
  */
  const duplicateSlugQuery = query(
    collection(db, "forms"),
    where("slug", "==", normalizedSlug)
  );

  const duplicateSlugSnapshot = await getDocs(duplicateSlugQuery);

  if (!duplicateSlugSnapshot.empty) {
    throw new Error(
      "この公開URL名はすでに使用されています。別の公開URL名を指定してください。"
    );
  }

  // Firestoreに保存した後に取得するフォームID
  let createdFormId = "";

  /*
    Firestoreへの保存処理
  */
  try {
    const docRef = await addDoc(collection(db, "forms"), {
      title,
      description,
      slug: normalizedSlug,

      // 作成直後は下書きにする
      // 管理画面から published に変更すると公開される
      status: "draft",

      createdAt: serverTimestamp(),
    });

    createdFormId = docRef.id;

    console.log("Firestore保存成功:", createdFormId);
  } catch (error) {
    console.error("Firestore保存エラー:", error);
    throw new Error("Firestoreへの保存に失敗しました");
  }

  // フォームの質問項目編集ページへ移動
  redirect(`/admin/firebase/forms/${createdFormId}/fields`);
}