import Link from "next/link";

import { StorefrontShell } from "@/components/layout";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() { return <StorefrontShell><div className="mx-auto grid min-h-[60svh] max-w-3xl place-items-center px-5 py-16"><EmptyState title="Halaman tidak ditemukan" description="Alamat mungkin berubah atau koleksi sudah tidak tersedia." action={<Button asChild><Link href="/products">Jelajahi koleksi</Link></Button>} /></div></StorefrontShell>; }
