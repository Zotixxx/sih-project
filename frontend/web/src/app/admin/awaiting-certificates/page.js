"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AwaitingCertificatesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/verify");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-slate-500">
      Redirecting to Verify...
    </div>
  );
}
