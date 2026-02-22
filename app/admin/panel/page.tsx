// /admin/panel is deprecated.
// All admin functionality is now at /dashboard/admin
// This redirect protects against bookmarks to the old URL.
import { redirect } from "next/navigation"

export default function AdminPanelRedirect() {
  redirect("/dashboard/admin")
}
