import Link from "next/link";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() { return <section className="grid min-h-[60vh] place-items-center text-center"><div><LockKeyIcon className="mx-auto size-12 text-[#a28a5b]" weight="thin" aria-hidden /><h1 className="mt-5 font-serif text-4xl">Access restricted</h1><p className="mt-3 text-sm text-muted-foreground">Role Anda tidak memiliki izin untuk membuka modul ini.</p><Button asChild className="mt-6"><Link href="/admin">Kembali ke dashboard</Link></Button></div></section>; }
