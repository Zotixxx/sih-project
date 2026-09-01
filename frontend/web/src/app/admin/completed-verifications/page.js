"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompletedVerificationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/certificates");
  }, [router]);

  return null;
}
