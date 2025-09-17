"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Eye, MoreHorizontal, Search, FileText, Calendar, Building, User, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Proposal {
  id: string
  title: string
  type: "quotation" | "partnership"
  recipient_name: string
  recipient_company: string
  status: "draft" | "completed" | "sent"
  created_at: string
  updated_at: string
  total_amount: number
  creator_name: string
  pdf_url?: string
}

export default function ProposalsPage() {
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("proposals").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProposals(data || [])
    } catch (error) {
      console.error("Error fetching proposals:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data proposal",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async (proposal: Proposal) => {
    try {
      if (proposal.pdf_url) {
        // Download existing PDF
        const link = document.createElement("a")
        link.href = proposal.pdf_url
        link.download = `proposal-${proposal.type}-${proposal.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Generate new PDF
        toast({
          title: "Generating PDF",
          description: "Dokumen PDF sedang dibuat...",
        })
        // Here you would call the PDF generation API
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengunduh PDF",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProposal = async (proposalId: string) => {
    try {
      const { error } = await supabase.from("proposals").delete().eq("id", proposalId)

      if (error) throw error

      setProposals(proposals.filter((p) => p.id !== proposalId))
      toast({
        title: "Proposal Dihapus",
        description: "Proposal berhasil dihapus dari sistem",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus proposal",
        variant: "destructive",
      })
    }
  }

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.recipient_company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      completed: "default",
      sent: "outline",
    } as const

    const labels = {
      draft: "Draft",
      completed: "Selesai",
      sent: "Terkirim",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Proposal Management</h1>
              <p className="text-muted-foreground">Kelola dan unduh proposal yang telah dibuat</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Daftar Proposal
                  </CardTitle>
                  <CardDescription>Proposal yang telah dibuat dan siap untuk diunduh</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari proposal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proposal</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProposals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {searchTerm
                                ? "Tidak ada proposal yang sesuai dengan pencarian"
                                : "Belum ada proposal yang dibuat"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{proposal.title}</p>
                              <p className="text-sm text-muted-foreground">oleh {proposal.creator_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{proposal.type === "quotation" ? "Penawaran" : "Kerjasama"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{proposal.recipient_name}</p>
                              <p className="text-sm text-muted-foreground">{proposal.recipient_company}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(proposal.total_amount)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(proposal.created_at), "dd MMM yyyy", { locale: id })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedProposal(proposal)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF(proposal)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <Separator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteProposal(proposal.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Proposal</DialogTitle>
                <DialogDescription>Informasi lengkap proposal yang telah dibuat</DialogDescription>
              </DialogHeader>
              {selectedProposal && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Judul Proposal</label>
                      <p className="font-medium">{selectedProposal.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipe</label>
                      <p>{selectedProposal.type === "quotation" ? "Penawaran Harga" : "Kerjasama"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Penerima</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedProposal.recipient_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedProposal.recipient_company}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedProposal.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Nilai</label>
                      <p className="font-bold text-lg text-primary">{formatCurrency(selectedProposal.total_amount)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button onClick={() => handleDownloadPDF(selectedProposal)} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedProposal(null)}>
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
