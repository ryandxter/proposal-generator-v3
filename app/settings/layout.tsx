import type React from "react"
import { Navigation } from "@/components/navigation"
import { SettingsNavigation } from "@/components/settings-navigation"
import { ProtectedRoute } from "@/components/protected-route"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64">
              <SettingsNavigation />
            </aside>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
