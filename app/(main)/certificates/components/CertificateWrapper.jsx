import { Suspense } from "react";
import CertificatesPage from "../page";

export default function CertificateWrapper() {
  return (
    <Suspense fallback={<div>Loading certificates...</div>}>
      <CertificatesPage />
    </Suspense>
  );
}
