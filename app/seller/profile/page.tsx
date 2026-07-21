import { SellerPageHeader } from "@/components/seller/seller-page-header";
import { SellerProfileForm } from "@/components/seller/seller-profile-form";
import { requireSeller } from "@/lib/seller/auth";
export default async function SellerProfilePage() { const { seller } = await requireSeller(); return <div><SellerPageHeader title="Seller profile" description="Pastikan rekening benar. Data rekening hanya ditampilkan sebagian pada payout." /><SellerProfileForm initial={{ displayName: seller.displayName, phone: seller.phone, bio: seller.bio ?? "", bankName: seller.bankName ?? "", bankAccountName: seller.bankAccountName ?? "", bankAccountNumber: seller.bankAccountNumber ?? "" }} /></div>; }
