// blog/page.tsx
export default function BlogListPage() {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Nuestro Blog</h1>
        <ul className="space-y-6">
          {["primer-post", "actualizacion-abril"].map(slug => (
            <li key={slug}>
              <a href={`/blog/${slug}`} className="text-blue-600 hover:underline">
                {slug.replaceAll("-", " ")}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
 