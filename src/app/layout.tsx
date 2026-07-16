import './globals.css';

export const metadata = {
  title: 'TEXO · Cultura de innovación y diseño centrado en las personas',
  description:
    'Instrumento TEXO para diagnosticar cultura de innovación, diseño centrado en las personas y próximos pasos por agencia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
