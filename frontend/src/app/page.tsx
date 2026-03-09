import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Cardápio Universal
      </h1>
      <p className="mt-2 text-gray-600">
        Acesse o cardápio da sua loja pelo link único.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Exemplo: <Link href="/minha-loja" className="text-primary underline">/minha-loja</Link>
      </p>
    </main>
  );
}
