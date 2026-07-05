import './globals.css';

export const metadata = {
  title: 'RaihanTV',
  description: 'A modern live TV channel browser with HLS/TS playback.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
