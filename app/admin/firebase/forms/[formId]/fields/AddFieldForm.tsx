"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  formId: string;
};

export default function AddFieldForm({ formId }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const label = String(formData.get("label") ?? "").trim();
    const fieldName = String(formData.get("field_name") ?? "").trim();
    const fieldType = String(formData.get("field_type") ?? "text");
    const options = String(formData.get("options") ?? "").trim();
    const required = formData.get("required") === "true";
    const sortOrder = Number(formData.get("sort_order") ?? 0);

    if (!label || !fieldName) {
      alert("質問名とフィールド名は必須です。");
      return;
    }

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, "form_fields"), {
        formId,
        label,
        fieldName,
        fieldType,
        options,
        required,
        sortOrder,
        createdAt: serverTimestamp(),
      });

      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("質問項目の追加に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-4 rounded border p-4"
    >
      <div>
        <label className="mb-1 block font-medium">質問名</label>
        <input
          type="text"
          name="label"
          required
          className="w-full rounded border p-2"
          placeholder="例：氏名"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">フィールド名</label>
        <input
          type="text"
          name="field_name"
          required
          className="w-full rounded border p-2"
          placeholder="例：name"
        />
        <p className="mt-1 text-sm text-gray-500">
          半角英数字とアンダースコアで入力してください。例：passport_number
        </p>
      </div>

      <div>
        <label className="mb-1 block font-medium">入力タイプ</label>
        <select
          name="field_type"
          required
          className="w-full rounded border p-2"
        >
          <option value="text">1行テキスト</option>
          <option value="textarea">複数行テキスト</option>
          <option value="email">Email</option>
          <option value="date">日付</option>
          <option value="select">選択式</option>
          <option value="checkbox">チェックボックス</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block font-medium">選択肢</label>
        <textarea
          name="options"
          className="h-20 w-full rounded border p-2"
          placeholder="選択式の場合のみ入力。例：男性,女性,その他"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="required" value="true" />
          <span>必須項目にする</span>
        </label>
      </div>

      <div>
        <label className="mb-1 block font-medium">表示順</label>
        <input
          type="number"
          name="sort_order"
          defaultValue="0"
          className="w-full rounded border p-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "追加中..." : "質問項目を追加"}
      </button>
    </form>
  );
}