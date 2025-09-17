import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Settings, Palette, Download } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-balance mb-4">Generator Proposal Bisnis</h1>
        <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
          Buat proposal penawaran profesional dengan template yang dapat disesuaikan, perhitungan harga otomatis, dan
          ekspor PDF. Sederhanakan proses pembuatan proposal Anda.
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Buat Proposal Baru
            </CardTitle>
            <CardDescription>Mulai membuat proposal penawaran quotation atau partnership</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create-proposal">
              <Button className="w-full" size="lg">
                Mulai Membuat Proposal
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Kelola Template
            </CardTitle>
            <CardDescription>Atur template company profile, layanan, syarat ketentuan, dan portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                Buka Pengaturan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Designer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Atur desain dan tema halaman dengan overlay, header, footer, dan ukuran halaman
            </p>
            <Link href="/designer">
              <Button variant="outline" className="w-full bg-transparent">
                Buka Designer
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Kelola template pembuka, keuntungan layanan, syarat ketentuan, dan portfolio
            </p>
            <Link href="/settings/templates">
              <Button variant="outline" className="w-full bg-transparent">
                Kelola Template
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Produk & Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Buat daftar produk dan layanan dengan harga jual dan HPP untuk rekapan
            </p>
            <Link href="/settings/products">
              <Button variant="outline" className="w-full bg-transparent">
                Kelola Produk
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Cara Penggunaan</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Pilih Tipe Proposal",
              description: "Pilih antara quotation atau partnership sesuai kebutuhan",
            },
            {
              step: "2",
              title: "Isi Detail Proposal",
              description: "Masukkan informasi penerima, pilih template, dan atur tanggal",
            },
            {
              step: "3",
              title: "Generate PDF",
              description: "Klik generate untuk membuat dokumen proposal lengkap dengan portfolio",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
