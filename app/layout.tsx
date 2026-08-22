import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MRK AI Web Builder',
  description: 'AI coding workspace for GitHub repositories powered by Gemini.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
  description: 'Build and modify websites with natural-language AI instructions and GitHub.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
