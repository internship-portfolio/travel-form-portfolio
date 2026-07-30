import PublicFirebaseForm from "@/components/PublicFirebaseForm";

export default function HomePage() {
  const slug = process.env.DEFAULT_FORM_SLUG;

  if (!slug) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-bold">
            現在、申請フォームを利用できません。
          </h1>
        </div>
      </main>
    );
  }

  return <PublicFirebaseForm slug={slug} />;
}