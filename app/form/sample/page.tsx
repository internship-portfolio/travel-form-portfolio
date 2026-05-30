import { submitResponse } from '@/app/actions/submitResponse';

export default function SampleFormPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          旅行申込フォーム
        </h1>

        <p className="mb-6 text-gray-600">
          必要事項を入力して送信してください。
        </p>

        <form action={submitResponse} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">申込日</label>
            <input
              type="date"
              name="application_date"
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">契約代表者氏名</label>
            <input
              type="text"
              name="representative_name"
              required
              className="w-full rounded border p-2"
              placeholder="例：山田 太郎"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              未成年の場合：親権者同意サイン欄
            </label>
            <textarea
              name="guardian_signature"
              className="h-24 w-full rounded border p-2"
              placeholder="未成年の場合、親権者の同意サインを入力してください"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              氏名（パスポート名アルファベット）
            </label>
            <input
              type="text"
              name="passport_name_alphabet"
              required
              className="w-full rounded border p-2"
              placeholder="例：TARO YAMADA"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">生年月日</label>
            <input
              type="date"
              name="birth_date"
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">性別</label>
            <select
              name="gender"
              required
              className="w-full rounded border p-2"
            >
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
              <option value="回答しない">回答しない</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">国籍</label>
            <input
              type="text"
              name="nationality"
              required
              className="w-full rounded border p-2"
              placeholder="例：日本"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">パスポート番号</label>
            <input
              type="text"
              name="passport_number"
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">パスポート有効期限</label>
            <input
              type="date"
              name="passport_expiry_date"
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              ビザが必要な場合の取得状況
            </label>
            <select
              name="visa_status"
              className="w-full rounded border p-2"
            >
              <option value="">選択してください</option>
              <option value="不要">不要</option>
              <option value="取得済み">取得済み</option>
              <option value="申請中">申請中</option>
              <option value="未取得">未取得</option>
              <option value="不明">不明</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">住所（フリガナ）</label>
            <textarea
              name="address_furigana"
              required
              className="h-24 w-full rounded border p-2"
              placeholder="住所とフリガナを入力してください"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">連絡先</label>
            <input
              type="text"
              name="contact"
              required
              className="w-full rounded border p-2"
              placeholder="例：090-0000-0000"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded border p-2"
              placeholder="example@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              旅行中の連絡者氏名
            </label>
            <input
              type="text"
              name="emergency_contact_name"
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              旅行中の連絡者本人との続柄
            </label>
            <input
              type="text"
              name="emergency_contact_relationship"
              required
              className="w-full rounded border p-2"
              placeholder="例：父、母、配偶者、兄弟など"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              旅行中の連絡先 電話番号等
            </label>
            <input
              type="text"
              name="emergency_contact_phone"
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              旅行保険の加入の有無
            </label>
            <select
              name="travel_insurance"
              required
              className="w-full rounded border p-2"
            >
              <option value="">選択してください</option>
              <option value="加入済み">加入済み</option>
              <option value="未加入">未加入</option>
              <option value="加入予定">加入予定</option>
            </select>
          </div>

          <div className="rounded border p-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="privacy_policy_confirmed"
                value="true"
                required
                className="mt-1"
              />
              <span>
                個人情報の取り扱いについて確認しました。
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            送信する
          </button>
        </form>
      </div>
    </main>
  );
}