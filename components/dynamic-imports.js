import dynamic from "next/dynamic";

export const DynamicChatbot = dynamic(() => import("@/components/Chatbot"), {
  loading: () => (
    <div className="h-[600px] animate-pulse bg-neutral-900 rounded-xl" />
  ),
  ssr: false,
});

export const DynamicErrorBoundary = dynamic(
  () =>
    import("@/components/ErrorBoundary").then((mod) => ({
      default: mod.ErrorBoundary,
    })),
  { ssr: true }
);

export const DynamicMarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded" />,
    ssr: false,
  }
);
