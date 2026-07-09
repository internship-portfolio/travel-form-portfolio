"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type FieldType = "text" | "textarea" | "email" | "date" | "select" | "checkbox";

type Field = {
  id: string;
  label?: string;
  fieldName?: string;
  fieldType?: string;
  options?: string;
  required?: boolean;
  sortOrder?: number;
};

type Props = {
  field: Field;
};

export default function EditFieldButton({ field }: Props) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [label, setLabel] = useState(field.label ?? "");
  const [fieldName, setFieldName] = useState(field.fieldName ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(
    (field.fieldType as FieldType) || "text"
  );
  const [options, setOptions] = useState(field.options ?? "");
  const [required, setRequired] = useState(field.required ?? false);
  const [sortOrder, setSortOrder] = useState(String(field.sortOrder ?? 0));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!label.trim()) {
      alert("質問名を入力してください。");
      return;
    }

    if (!fieldName.trim()) {
      alert("フィールド名を入力してください。");
      return;
    }

    // if (!/^[a-zA-Z0-9_]+$/.test(fieldName.trim())) {
    //   alert("フィールド名は半角英数字とアンダースコアのみ使用できます。");
    //   return;
    // }

    try {
      setIsSaving(true);

      await updateDoc(doc(db, "form_fields", field.id), {
        label: label.trim(),
        fieldName: fieldName.trim(),
        fieldType,
        options: options.trim(),
        required,
        sortOrder: Number(sortOrder || 0),
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("質問項目の更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
      >
        編集
      </button>
    );
  }

  return (
    <div className="rounded border bg-yellow-50 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-bold">質問名</label>
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">フィールド名</label>
          <input
            type="text"
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            className="w-full rounded border p-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            半角英数字とアンダースコアのみ使用できます。
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">入力タイプ</label>
          <select
            value={fieldType}
            onChange={(event) => setFieldType(event.target.value as FieldType)}
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
          <label className="mb-1 block text-sm font-bold">選択肢</label>
          <textarea
            value={options}
            onChange={(event) => setOptions(event.target.value)}
            className="h-20 w-full rounded border p-2"
            placeholder="選択式の場合のみ入力。例：男性,女性,その他"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(event) => setRequired(event.target.checked)}
            />
            <span>必須項目にする</span>
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">表示順</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded bg-blue-600 px-3 py-1 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="rounded border px-3 py-1 font-bold hover:bg-gray-100"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}