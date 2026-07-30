import PublicFirebaseForm from "@/components/PublicFirebaseForm";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function FirebasePublicFormPage({
  params,
}: Props) {
  const { slug } = await params;

  return <PublicFirebaseForm slug={slug} />;
}