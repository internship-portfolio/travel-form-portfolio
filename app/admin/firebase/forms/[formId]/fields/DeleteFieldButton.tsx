"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  fieldId: string;
  fieldLabel?: string;
};

export default function DeleteFieldButton({ fieldId, fieldLabel }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `「${fieldLabel || "この質問項目"}」を削除しますか？\n\n削除すると、今後この質問項目はフォームに表示されなくなります。`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteDoc(doc(db, "form_fields", fieldId));

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("質問項目の削除に失敗しました。");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:bg-gray-400"
    >
      {isDeleting ? "削除中..." : "削除"}
    </button>
  );
}