"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building, Briefcase, Shield, FileText, Package, Settings } from "lucide-react"

const settingsNavigation = [
  {
    name: "Umum",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Company Profile",
    href: "/settings/templates/company-profile",
    icon: Building,
  },
  {
    name: "Keuntungan Layanan",
    href: "/settings/templates/service-benefits",
    icon: Briefcase,
  },
  {
    name: "Syarat & Ketentuan",
    href: "/settings/templates/terms-conditions",
    icon: Shield,
  },
  {
    name: "Portfolio",
    href: "/settings/portfolio",
    icon: FileText,
  },
  {
    name: "Produk & Layanan",
    href: "/settings/products",
    icon: Package,
  },
]

export function SettingsNavigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      <h2 className="mb-4 text-lg font-semibold">Pengaturan</h2>
      {settingsNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}
