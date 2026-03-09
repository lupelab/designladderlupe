import './globals.css';

export const metadata = {
  title: 'TEXO Design Maturity Platform',
  description: 'Diagnóstico de madurez de diseño para agencias del holding TEXO.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
