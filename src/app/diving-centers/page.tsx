import { fetchDivingCenters } from "@/api/diving-centers";
import DivingCentersClient from "@/components/DivingCentersClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Diving Centers | Fishy Dex",
  description: "Browse all available diving centers and their details",
};

export default async function DivingCentersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const centers = await fetchDivingCenters();

  return (
    <div className="h-screen bg-dark-navy text-text-primary">
      <div className="max-w-7xl mx-auto h-full">
        <DivingCentersClient centers={centers} />
      </div>
    </div>
  );
}
