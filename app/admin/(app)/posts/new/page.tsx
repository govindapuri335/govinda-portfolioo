import { redirect } from "next/navigation";

// Blog admin was consolidated under /admin/blogs. Keep this route as a
// permanent redirect so any existing bookmarks continue to work.
export default function LegacyNewPostRedirect() {
  redirect("/admin/blogs/new");
}
