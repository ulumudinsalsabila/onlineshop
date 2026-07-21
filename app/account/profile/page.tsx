import { AccountHeading } from "@/components/account/account-heading";
import { ProfileForm } from "@/components/account/profile-form";
import { requireUser } from "@/lib/auth-guard";

export default async function ProfilePage() { const user = await requireUser(); return <div><AccountHeading eyebrow="Personal details" title="Profile" description="Informasi ini digunakan untuk komunikasi pesanan dan pengalaman yang lebih personal." /><ProfileForm initialName={user.name ?? ""} email={user.email} initialPhone={user.phone ?? ""} /></div>; }
