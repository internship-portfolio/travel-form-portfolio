import dotenv from "dotenv";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

async function main() {
  const uid = "YOUR_ADMIN_USER_UID";

  await getAuth().setCustomUserClaims(uid, {
    admin: true,
  });

  console.log("管理者権限を付与しました");
}

main().catch((error) => {
  console.error(error);
});