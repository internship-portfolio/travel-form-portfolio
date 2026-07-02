"use server";

import { redirect } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function submitFirebaseResponse(formData: FormData) {
  const formId = formData.get("form_id") as string;
  const fieldIds = formData.getAll("field_ids") as string[];

  if (!formId || fieldIds.length === 0) {
    throw new Error("フォーム情報が不足しています");
  }

  // ここでフォームの状態を確認する
  const formRef = doc(db, "forms", formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error("フォームが見つかりません。");
  }

  const formDocData = formSnap.data();

  if (formDocData.status !== "published") {
    throw new Error("このフォームは現在回答を受け付けていません。");
  }

  // published の場合だけ、ここから回答を保存する
  const responseRef = await addDoc(collection(db, "responses"), {
    formId,
    createdAt: serverTimestamp(),
  });

  const batch = writeBatch(db);

  fieldIds.forEach((fieldId) => {
    const value = String(formData.get(`field_${fieldId}`) ?? "");

    const answerRef = doc(collection(db, "response_answers"));

    batch.set(answerRef, {
      responseId: responseRef.id,
      formId,
      fieldId,
      value,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();

  redirect("/complete");
}