import { Layout } from "../components/Layout";
import { LinkButton } from "../components/Button";

export function NotFoundPage() {
  return (
    <Layout>
      <main className="section-shell flex min-h-[60vh] flex-col items-start justify-center py-20">
        <p className="text-label uppercase text-rose">404</p>
        <h1 className="mt-2 font-display text-5xl">Page not found</h1>
        <p className="mt-4 max-w-lg text-taupe">This page does not exist. Return to the wedding site.</p>
        <LinkButton to="/" className="mt-8">
          Go home
        </LinkButton>
      </main>
    </Layout>
  );
}
