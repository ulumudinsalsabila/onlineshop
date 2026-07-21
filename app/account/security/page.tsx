import { AccountHeading } from "@/components/account/account-heading";
import { SecurityForm } from "@/components/account/security-form";

export default function SecurityPage() { return <div><AccountHeading eyebrow="Account protection" title="Security" description="Update your password regularly and avoid reusing it across other services." /><SecurityForm /></div>; }
