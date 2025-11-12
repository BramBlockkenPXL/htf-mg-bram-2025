import { fetchFishes } from "@/api/fish";
import FishCatalogClient from "@/components/FishCatalogClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Fish Catalog | Fishy Dex",
  description: "Complete catalog of all fish species available in Fishy Dex",
};

export default async function CatalogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const fishes = await fetchFishes();

  return (
    <div className="h-screen bg-dark-navy text-text-primary">
      <div className="max-w-7xl mx-auto h-full">
        <FishCatalogClient fishes={fishes} />
      </div>
    </div>
  );
}
