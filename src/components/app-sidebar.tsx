"use client"

import * as React from "react"
import {
  // AudioWaveform,
  // BookOpen,
  // Command,
  // Frame,
  // Map,
  // PieChart,
  // Settings2,
  GalleryVerticalEnd,
  // Bot,
  SquareTerminal,
 
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
// import { NavProjects } from "@/components/nav-projects"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Organic Ads Admin",
    email: "contact@organicads.in",
    avatar: "https://res.cloudinary.com/djiki7tvo/image/upload/v1745214703/shadcn_hoepq2.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
 
  ],
  navMain: [
    {
      title: "SEO Pages",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Domestic Pages",
          url: "/dashboard/domestic",
        },
        {
          title: "International Pages",
          url: "/dashboard/international",
        },
        {
          title: "Import Pages",
          url: "/dashboard/import",
        },
        {
          title: "Generate Sitemap",
          url: "/dashboard/generate-sitemap",
        },
      ],
    },
    // {
    //   title: "Digital Marketing",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Domestic Pages",
    //       url: "#",
    //     },
    //     {
    //       title: "International Pages",
    //       url: "#",
    //     },
    //     {
    //       title: "Import Pages",
    //       url: "#",
    //     },
    //   ],
    // },
    
    
  ],

  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
       <SidebarHeader className="flex items-center justify-center p-4">
        <img
          src="https://res.cloudinary.com/s2ucdn/image/upload/v1734515561/organicads-logo_n5yg79.png"
          alt="OrganicAds Logo"
          className="h-10 w-auto"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
    
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
