"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Award, ArrowLeft, Download, Loader2, Share2 } from "lucide-react";

export default function CertificateViewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetch(`/api/certificates/${id}`);
        if (!res.ok) throw new Error("Failed to fetch certificate");
        const data = await res.json();
        setCertificate(data);
      } catch (error) {
        console.error("Error fetching certificate:", error);
        router.push("/certificates");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id, router]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Use html2canvas to capture the certificate
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${certificate.courseName
          .replace(/\s+/g, "-")
          .toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate.courseName}`,
          text: `I completed the "${certificate.courseName}" course on CareerGuide AI!`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const issuedDate = new Date(certificate.issueDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/certificates")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Certificates</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloading ? "Downloading..." : "Download"}</span>
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Certificate Border Design */}
          <div className="relative p-2 bg-linear-to-r from-yellow-400 via-amber-500 to-yellow-400">
            <div className="bg-white p-8 md:p-12">
              {/* Inner Border */}
              <div className="border-4 border-double border-amber-400 p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-linear-to-br from-yellow-400 to-amber-500 rounded-full">
                      <Award className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
                    Certificate of Completion
                  </h1>
                  <p className="text-gray-500 text-lg">
                    This is to certify that
                  </p>
                </div>

                {/* Recipient Name */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-600 border-b-2 border-amber-400 inline-block pb-2 px-8">
                    {certificate.userName}
                  </h2>
                </div>

                {/* Description */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-lg mb-4">
                    has successfully completed the course
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    &ldquo;{certificate.courseName}&rdquo;
                  </h3>
                </div>

                {/* Date and Signature */}
                <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-gray-900 font-semibold">{issuedDate}</p>
                    <p className="text-gray-500 text-sm mt-1">Date Issued</p>
                  </div>
                  <div className="text-center">
                    <div className="font-serif text-2xl text-amber-600 italic mb-1">
                      CareerGuide AI
                    </div>
                    <p className="text-gray-500 text-sm">
                      AI-Powered Learning Platform
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900 font-mono text-sm">
                      {certificate.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Certificate ID</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            This certificate verifies that the above-named individual has
            completed all requirements of the course.
          </p>
        </div>
      </div>
    </div>
  );
}
