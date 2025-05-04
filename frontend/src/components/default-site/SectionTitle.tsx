import Link from 'next/link';

export default function SectionTitle({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} passHref>
      <h2 className="text-3xl font-semibold text-blue-600 hover:underline transition mb-6 text-center">
        {children}
      </h2>
    </Link>
  );
}
