import "./globals.css";
// Force redeploy - 2026-05-04 15:40

export const metadata = {
  title: {
    default: "Crotti Safety",
    template: "%s | Crotti Safety",
  },
  description: "Portale cliente Crotti Safety con Next.js App Router e Supabase.",
  applicationName: "Crotti Safety",
  metadataBase: new URL("https://crotti-safety.vercel.app"),
  openGraph: {
    title: "Crotti Safety",
    description: "Portale cliente Crotti Safety con Next.js App Router e Supabase.",
    type: "website",
  },
};

// FIX: viewport esportato secondo il pattern App Router moderno.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e30613",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
