import { redirect } from "next/navigation";

// Blog admin was consolidated under /admin/blogs. Keep this route as a
// permanent redirect so any existing bookmarks / open editor tabs continue
// to work.
interface Props {
  params: Promise<{ id: string }>;
}

export default async function LegacyEditPostRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/blogs/${id}/edit`);
}
