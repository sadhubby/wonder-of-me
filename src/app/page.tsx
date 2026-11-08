import { Suspense } from "react";

import { Dashboard } from "@/components/dashboard/dashboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Hero } from "@/components/dashboard/hero";
import { SiteFooter } from "@/components/dashboard/site-footer";
import { getDashboardSnapshot } from "@/db/queries";

async function DashboardContent() {
  const data = await getDashboardSnapshot();
  return <Dashboard data={data} />;
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Hero />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
