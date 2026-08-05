import {
  ContactsList,
  type AdminContactRow,
} from "@/components/admin/contacts-list";
import { listContactSubmissions } from "@/lib/admin/contacts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contacts" };

export default async function AdminContactsPage() {
  let rows: AdminContactRow[] = [];
  let loadError: string | null = null;

  try {
    const data = await listContactSubmissions();
    rows = data.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      socials: r.socials,
      read: r.read,
      ip: r.ip,
      userAgent: r.userAgent,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load contacts";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 font-heading text-2xl">Contact messages</h1>
          <p className="text-sm text-muted-foreground">
            Every submission from the public /contact form. A notification is
            also emailed to you when a new message arrives.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loadError}
        </div>
      ) : (
        <ContactsList initial={rows} />
      )}
    </div>
  );
}
