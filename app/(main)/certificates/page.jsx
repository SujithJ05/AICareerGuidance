import { Suspense } from "react";
import CertificatesClientPage from "./certificates-client-page";

export default function CertificatesServerPage() {
  return (
    <Suspense fallback={<div>Loading certificates...</div>}>
      <CertificatesClientPage />
    </Suspense>
  );
}
