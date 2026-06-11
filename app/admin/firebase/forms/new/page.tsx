//createFirevaseForm.ts読み込み、関数を使用できるように
import { createFirebaseForm } from '@/app/actions/firebase/createFirebaseForm';

//export default function NewFirebaseFormPage:新しいフォームを作成するための入力画面の作成
export default function NewFirebaseFormPage() {
  //returnの中に書かれているのが画面の表示内容
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          Firebase版フォーム作成
        </h1>

        <p className="mb-6 text-gray-600">
          Firestoreに保存する新しい公開フォームを作成します。
        </p>

        <form action={createFirebaseForm} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">
              フォーム名
            </label>
            <input
              type="text"//入力欄のタイプ
              name="title"//入力欄の名前
              required//入力が必須
              className="w-full rounded border p-2"//見た目の設定
              placeholder="例：旅行申込フォーム"//入力例の表示
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              説明文
            </label>
            <textarea
              name="description"
              className="h-24 w-full rounded border p-2"
              placeholder="フォームの説明を入力してください"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              公開URL名
            </label>
            <input
              type="text"
              name="slug"
              required
              className="w-full rounded border p-2"
              placeholder="例：travel-application"
            />
            <p className="mt-1 text-sm text-gray-500">
              半角英数字とハイフンで入力してください。例：travel-application
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Firebaseにフォームを作成する
          </button>
        </form>
      </div>
    </main>
  );
}
/*
  <main>:ページ全体のメイン領域の定義
  <div>:フォーム全体を囲む白いカードのような部分
  <h1>:見出し
  <p>:ページに表示される文章
  <form action={createFirebaseForm} ...>:formが送られた際に"createFirebaseFrom"が実行される
  <lable>:入力欄のラベル（説明文）
  <input>:入力欄の設置
  <button>:ボタンの設置
*/