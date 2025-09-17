import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Building, Shield, Briefcase, Package } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola template dan konfigurasi untuk proposal Anda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Profile
            </CardTitle>
            <CardDescription>Atur template pembuka dan profil perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/templates/company-profile">
              <Button className="w-full">Kelola Company Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Keuntungan Layanan
            </CardTitle>
            <CardDescription>Template keuntungan dan benefit layanan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/templates/service-benefits">
              <Button className="w-full">Kelola Keuntungan Layanan</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Syarat & Ketentuan
            </CardTitle>
            <CardDescription>Template syarat dan ketentuan layanan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/templates/terms-conditions">
              <Button className="w-full">Kelola Syarat & Ketentuan</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Portfolio
            </CardTitle>
            <CardDescription>Upload dan kelola file portfolio PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/portfolio">
              <Button className="w-full">Kelola Portfolio</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produk & Layanan
            </CardTitle>
            <CardDescription>Daftar produk dan layanan dengan harga jual dan HPP</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/products">
              <Button className="w-full">Kelola Produk & Layanan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
