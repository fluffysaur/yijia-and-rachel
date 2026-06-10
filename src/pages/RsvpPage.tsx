import { Layout } from "../components/Layout";
import { RsvpContent } from "../components/RsvpContent";

export function RsvpPage() {
  return (
    <Layout>
      <main className="bg-white py-14">
        <RsvpContent />
      </main>
    </Layout>
  );
}
