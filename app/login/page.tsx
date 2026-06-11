"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
        alert("管理者権限がありません");
        return;
      }

      router.push("/admin");
    } catch (error) {
      console.error(error);
      alert("ログインに失敗しました");
    }
  }

  return (
    <main>
      <h1>管理者ログイン</h1>

      <div>
        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label>パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button type="button" onClick={handleLogin}>
        ログイン
      </button>
    </main>
  );
}