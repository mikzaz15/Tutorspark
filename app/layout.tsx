import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TutorSpark',
  description: 'K-12 tutoring app with diagnostics and practice.'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
