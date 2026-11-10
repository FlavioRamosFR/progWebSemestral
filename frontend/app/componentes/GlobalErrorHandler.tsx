"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const rotasErro: Record<number, string> = {
  400: "/erro/400",
  401: "/erro/401",
  403: "/erro/403",
  404: "/erro/404",
  500: "/erro/500",
};

export default function GlobalErrorHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function tratarErro(event: Event) {
      const customEvent = event as CustomEvent<{
        status: number;
      }>;

      const status = customEvent.detail.status;

      const rota = rotasErro[status];

      if (rota && pathname !== rota) {
        router.replace(rota);
      }
    }

    window.addEventListener("api:http-error", tratarErro);

    return () => {
      window.removeEventListener("api:http-error", tratarErro);
    };
  }, [router, pathname]);

  return null;
}
