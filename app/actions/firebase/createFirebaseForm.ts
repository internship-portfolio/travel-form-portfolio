'use server';//サーバ側で実行することを明示

import { redirect } from 'next/navigation';//リダイレクト機能の読み込み
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';//ファイアベース関連の関数読み込み
import { db } from '@/lib/firebase';//設定ファイルからdbの読み込み、dbはFirestoreに接続するためのオブジェクト

/*
  createFirebaseForm関数を定義
  export:他のファイルから使用可能な関数
  async:非同期処理
  FormDate:引数の型、フォームから送信されたデータを受け取る
*/
export async function createFirebaseForm(formData: FormData) {
  console.log('createFirebaseForm が呼ばれました');//関数が呼び出された際に実行されるログ

  //フォームから送信されたデータを文字列として取得
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;

  //フォームから取得したデータ確認用ログ
  console.log('入力値:', {
    title,
    description,
    slug,
  });

  //title、slugが未入力の場合エラーを出力
  if (!title || !slug) {
    throw new Error('フォーム名と公開URL名は必須です');
  }

  /*
    slugを加工してUrlで使用できる形に成形
    .tirm():文字列前後の空白削除
    .toLowerCase():大文字を小文字に変換
    .replace(/\s+/g, '-'):スペースを'-'に置換
    ---------------------------------------
    \s:空白文字
    +:一文字以上
    g:すべて
    /\s+/g:空白が一文字以上続くものすべて
    ---------------------------------------
  */
  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  //firestoreに保存した後に取得するフォームIDの保存場所を宣言・初期化
  let createdFormId = '';

  /*
    firestoreへの保存処理
    collection(db, 'forms'):firesotreのformsコレクションを指定する
    addDoc():指定したコレクションに新しいドキュメントを追加する
    {}:保存される中身のデータ
  */
  try {
    const docRef = await addDoc(collection(db, 'forms'), {
      title,
      description,
      slug: normalizedSlug,
      status: 'public',
      createdAt: serverTimestamp(),
    });

    //フォームIDの代入
    createdFormId = docRef.id;

    //保存が完了したかのログ
    console.log('Firestore保存成功:', createdFormId);
    //失敗した際はエラーを表示
  } catch (error) {
    console.error('Firestore保存エラー:', error);
    throw new Error('Firestoreへの保存に失敗しました');
  }

  //フォームの編集ページへ飛ぶ
  redirect(`/admin/firebase/forms/${createdFormId}/fields`);
}