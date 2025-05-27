"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [counts, setCounts] = useState({ domestic: 0, international: 0 });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/getCounts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Fetch error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        setCounts(data);
      } catch (error) {
        console.error("Fetch Error:", (error as Error).message);
        setCounts({ domestic: 0, international: 0 });
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 5xl:grid-cols-4 gap-4 px-4 lg:px-6">
        {/* Card 1: Total Domestic */}
        <div className="data-[slot=card]:shadow-xs data-[slot=card]:bg-gradient-to-t data-[slot=card]:from-primary/4 data-[slot=card]:to-card dark:data-[slot=card]:bg-card">
          <Card className="@container/card" data-slot="card">
            <CardHeader className="relative">
              <CardDescription>Total Domestic</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {counts.domestic}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                  <TrendingUpIcon className="size-3" />
                  +12.5%
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending up this month <TrendingUpIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                The data from last 6 months
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Card 2: Total International */}
        <div className="data-[slot=card]:shadow-xs data-[slot=card]:bg-gradient-to-t data-[slot=card]:from-primary/5 data-[slot=card]:to-card dark:data-[slot=card]:bg-card">
          <Card className="@container/card" data-slot="card">
            <CardHeader className="relative">
              <CardDescription>Total International</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {counts.international}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                  <TrendingDownIcon className="size-3" />
                  -20%
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending down this month <TrendingDownIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                The data from last 6 months
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
