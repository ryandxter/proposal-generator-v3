"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ProposalData {
  companyProfile: string
  type: "quotation" | "partnership" | ""
  recipientName: string
  recipientCompany: string
  recipientAddress: string
  selectedProducts: string[]
  serviceBenefitsTemplate: string
  termsConditionsTemplate: string
  letterDate: Date | undefined
  creatorName: string
  creatorPosition: string
}

interface CompanyProfile {
  id: string
  name: string
  content: string
  is_default: boolean
}

interface ServiceBenefit {
  id: string
  name: string
  content: string
  is_default: boolean
}

interface TermsCondition {
  id: string
  name: string
  content: string
  is_default: boolean
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

export default function CreateProposalPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [proposalData, setProposalData] = useState<ProposalData>({
    companyProfile: "",
    type: "",
    recipientName: "",
    recipientCompany: "",
    recipientAddress: "",
    selectedProducts: [],
    serviceBenefitsTemplate: "",
    termsConditionsTemplate: "",
    letterDate: undefined,
    creatorName: "",
    creatorPosition: "",
  })

  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([])
  const [serviceBenefits, setServiceBenefits] = useState<ServiceBenefit[]>([])
  const [termsConditions, setTermsConditions] = useState<TermsCondition[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchTemplateData()
  }, [])

  const fetchTemplateData = async () => {
    try {
      setIsLoadingTemplates(true)

      const { data: profilesData, error: profilesError } = await supabase
        .from("company_profile_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) throw profilesError
      setCompanyProfiles(profilesData || [])

      const { data: benefitsData, error: benefitsError } = await supabase
        .from("service_benefit_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (benefitsError) throw benefitsError
      setServiceBenefits(benefitsData || [])

      const { data: termsData, error: termsError } = await supabase
        .from("terms_condition_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (termsError) throw termsError
      setTermsConditions(termsData || [])

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData || [])
    } catch (error) {
      console.error("Error fetching template data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data template",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const steps = [
    { id: 1, title: "Company Profile", description: "Pilih profil perusahaan" },
    { id: 2, title: "Tipe Proposal", description: "Pilih jenis proposal" },
    { id: 3, title: "Penerima (c.q.)", description: "Informasi ditujukan kepada" },
    { id: 4, title: "Produk", description: "Pilih produk & layanan" },
    { id: 5, title: "Template", description: "Keuntungan & Syarat Ketentuan" },
    { id: 6, title: "Tanggal & Pembuat", description: "Detail surat" },
    { id: 7, title: "Review & Export", description: "Tinjau dan export PDF" },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerateProposal = async () => {
    try {
      setIsGenerating(true)

      if (!proposalData.type) {
        toast({
          title: "Error",
          description: "Tipe proposal harus dipilih",
          variant: "destructive",
        })
        return
      }

      // Get designer settings
      const designerSettings = localStorage.getItem("designerSettings")
      const designSettings = designerSettings ? JSON.parse(designerSettings) : getDefaultDesignSettings()

      // Get selected templates content
      const selectedCompanyProfile = companyProfiles.find((p) => p.id === proposalData.companyProfile)
      const selectedServiceBenefits = serviceBenefits.find((b) => b.id === proposalData.serviceBenefitsTemplate)
      const selectedTermsConditions = termsConditions.find((t) => t.id === proposalData.termsConditionsTemplate)
      const selectedProducts = products.filter((p) => proposalData.selectedProducts.includes(p.id))

      // Prepare complete proposal data
      const completeProposalData = {
        ...proposalData,
        companyProfileContent: selectedCompanyProfile?.content || "",
        serviceBenefitsContent: selectedServiceBenefits?.content || "",
        termsConditionsContent: selectedTermsConditions?.content || "",
        products: selectedProducts,
        letterDate: proposalData.letterDate ? format(proposalData.letterDate, "dd MMMM yyyy", { locale: id }) : "",
      }

      // Generate PDF with complete data
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalData: completeProposalData,
          designSettings,
          templates: {
            companyProfile: selectedCompanyProfile,
            serviceBenefits: selectedServiceBenefits,
            termsConditions: selectedTermsConditions,
          },
          products: selectedProducts,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      // Save proposal to database
      const totalAmount = selectedProducts.reduce((sum, product) => sum + product.price, 0)

      const { data: savedProposal, error: saveError } = await supabase
        .from("proposals")
        .insert({
          title: `${proposalData.type === "quotation" ? "Penawaran" : "Kerjasama"} - ${proposalData.recipientCompany}`,
          proposal_type: proposalData.type,
          type: proposalData.type,
          recipient_name: proposalData.recipientName,
          recipient_company: proposalData.recipientCompany,
          recipient_address: proposalData.recipientAddress,
          status: "completed",
          total_amount: totalAmount,
          creator_name: proposalData.creatorName,
          creator_position: proposalData.creatorPosition,
          letter_date: proposalData.letterDate,
          company_profile_id: proposalData.companyProfile,
          service_benefits_template_id: proposalData.serviceBenefitsTemplate,
          terms_conditions_template_id: proposalData.termsConditionsTemplate,
          proposal_data: completeProposalData,
        })
        .select()
        .single()

      if (saveError) {
        console.error("Database save error:", saveError)
        throw saveError
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `proposal-${proposalData.type}-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "PDF Berhasil Dibuat",
        description:
          "Dokumen proposal telah berhasil dibuat dan disimpan. Anda dapat mengelolanya di halaman Proposals.",
      })

      // Redirect to proposals page
      window.location.href = "/proposals"
    } catch (error) {
      console.error("Error generating proposal:", error)
      toast({
        title: "Gagal Membuat PDF",
        description: "Terjadi kesalahan saat membuat dokumen proposal.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getDefaultDesignSettings = () => ({
    theme: "professional",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: 1.5,
    pageSize: "A4",
    margins: { top: 25, right: 25, bottom: 25, left: 25 },
    header: { enabled: true, height: 60, content: "Proposal Penawaran", showLogo: true },
    footer: { enabled: true, height: 40, content: "© 2024 Your Company Name", showPageNumbers: true },
    watermark: { enabled: false, text: "CONFIDENTIAL", opacity: 10 },
  })

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return proposalData.companyProfile !== ""
      case 2:
        return proposalData.type !== ""
      case 3:
        return proposalData.recipientName && proposalData.recipientCompany
      case 4:
        return proposalData.selectedProducts.length > 0
      case 5:
        return proposalData.serviceBenefitsTemplate && proposalData.termsConditionsTemplate
      case 6:
        return proposalData.letterDate && proposalData.creatorName
      default:
        return true
    }
  }

  const handleProductToggle = (productId: string) => {
    setProposalData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId],
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-muted",
                    )}
                  >
                    {step.id}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium whitespace-nowrap",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn("w-8 h-0.5 mx-2 sm:mx-4", currentStep > step.id ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Label>Pilih Company Profile</Label>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Select
                      value={proposalData.companyProfile}
                      onValueChange={(value) => setProposalData({ ...proposalData, companyProfile: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih template company profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                            {profile.is_default && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Company profile akan muncul di bagian pembuka proposal untuk memperkenalkan perusahaan Anda kepada
                      calon klien.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <Label>Pilih Tipe Proposal</Label>
                  <RadioGroup
                    value={proposalData.type}
                    onValueChange={(value) =>
                      setProposalData({ ...proposalData, type: value as "quotation" | "partnership" })
                    }
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
                      <RadioGroupItem value="quotation" id="quotation" />
                      <div className="flex-1">
                        <Label htmlFor="quotation" className="font-medium cursor-pointer">
                          Quotation (Penawaran Harga)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Proposal penawaran harga untuk produk atau layanan
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
                      <RadioGroupItem value="partnership" id="partnership" />
                      <div className="flex-1">
                        <Label htmlFor="partnership" className="font-medium cursor-pointer">
                          Partnership (Kerjasama)
                        </Label>
                        <p className="text-sm text-muted-foreground">Proposal kerjasama atau partnership bisnis</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="recipientName">Nama Penerima (c.q.)</Label>
                      <Input
                        id="recipientName"
                        value={proposalData.recipientName}
                        onChange={(e) => setProposalData({ ...proposalData, recipientName: e.target.value })}
                        placeholder="Nama lengkap penerima"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientCompany">Perusahaan</Label>
                      <Input
                        id="recipientCompany"
                        value={proposalData.recipientCompany}
                        onChange={(e) => setProposalData({ ...proposalData, recipientCompany: e.target.value })}
                        placeholder="Nama perusahaan"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="recipientAddress">Alamat</Label>
                    <Textarea
                      id="recipientAddress"
                      value={proposalData.recipientAddress}
                      onChange={(e) => setProposalData({ ...proposalData, recipientAddress: e.target.value })}
                      placeholder="Alamat lengkap perusahaan"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <Label>Pilih Produk & Layanan</Label>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50"
                        >
                          <Checkbox
                            id={product.id}
                            checked={proposalData.selectedProducts.includes(product.id)}
                            onCheckedChange={() => handleProductToggle(product.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={product.id} className="font-medium cursor-pointer">
                              {product.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                            <p className="text-sm font-medium text-primary mt-1">{formatPrice(product.price)}</p>
                            {product.category && (
                              <p className="text-xs text-muted-foreground mt-1">Kategori: {product.category}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Produk yang dipilih akan ditampilkan dalam proposal dengan harga jual. HPP (Cost of Goods Sold)
                      tidak akan ditampilkan dalam proposal.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="serviceBenefits">Template Keuntungan Layanan</Label>
                    {isLoadingTemplates ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <Select
                        value={proposalData.serviceBenefitsTemplate}
                        onValueChange={(value) => setProposalData({ ...proposalData, serviceBenefitsTemplate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih template keuntungan layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceBenefits.map((benefit) => (
                            <SelectItem key={benefit.id} value={benefit.id}>
                              {benefit.name}
                              {benefit.is_default && " (Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="termsConditions">Template Syarat & Ketentuan</Label>
                    {isLoadingTemplates ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <Select
                        value={proposalData.termsConditionsTemplate}
                        onValueChange={(value) => setProposalData({ ...proposalData, termsConditionsTemplate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih template syarat & ketentuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {termsConditions.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                              {term.is_default && " (Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <Label>Tanggal Surat</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !proposalData.letterDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {proposalData.letterDate
                            ? format(proposalData.letterDate, "PPP", { locale: id })
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={proposalData.letterDate}
                          onSelect={(date) => setProposalData({ ...proposalData, letterDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="creatorName">Nama Pembuat Surat</Label>
                      <Input
                        id="creatorName"
                        value={proposalData.creatorName}
                        onChange={(e) => setProposalData({ ...proposalData, creatorName: e.target.value })}
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <Label htmlFor="creatorPosition">Jabatan</Label>
                      <Input
                        id="creatorPosition"
                        value={proposalData.creatorPosition}
                        onChange={(e) => setProposalData({ ...proposalData, creatorPosition: e.target.value })}
                        placeholder="Jabatan dalam perusahaan"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Review Proposal</h3>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Company Profile</Label>
                          <p>{companyProfiles.find((p) => p.id === proposalData.companyProfile)?.name || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Tipe Proposal</Label>
                          <p className="capitalize">
                            {proposalData.type === "quotation"
                              ? "Quotation (Penawaran Harga)"
                              : "Partnership (Kerjasama)"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Ditujukan Kepada (c.q.)</Label>
                        <p className="font-medium">{proposalData.recipientName}</p>
                        <p>{proposalData.recipientCompany}</p>
                        <p className="text-sm text-muted-foreground">{proposalData.recipientAddress}</p>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Produk & Layanan Terpilih</Label>
                        <div className="mt-2 space-y-1">
                          {proposalData.selectedProducts.map((productId) => {
                            const product = products.find((p) => p.id === productId)
                            return product ? (
                              <div key={productId} className="flex justify-between items-center py-1">
                                <span>{product.name}</span>
                                <span className="font-medium text-primary">{formatPrice(product.price)}</span>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Template Keuntungan Layanan
                          </Label>
                          <p>
                            {serviceBenefits.find((b) => b.id === proposalData.serviceBenefitsTemplate)?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Template Syarat & Ketentuan
                          </Label>
                          <p>
                            {termsConditions.find((t) => t.id === proposalData.termsConditionsTemplate)?.name || "-"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Tanggal Surat</Label>
                          <p>
                            {proposalData.letterDate ? format(proposalData.letterDate, "PPP", { locale: id }) : "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Pembuat Surat</Label>
                          <p className="font-medium">{proposalData.creatorName}</p>
                          <p className="text-sm text-muted-foreground">{proposalData.creatorPosition}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Siap untuk Generate?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Dokumen proposal akan dibuat dengan template yang dipilih dan portfolio yang tersedia akan
                      dilampirkan dalam format PDF.
                    </p>
                    <Button onClick={handleGenerateProposal} className="w-full" size="lg" disabled={isGenerating}>
                      <Download className="h-4 w-4 mr-2" />
                      {isGenerating ? "Membuat PDF..." : "Generate Documents Now"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {currentStep < 7 && (
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                Sebelumnya
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                {currentStep === steps.length - 1 ? "Review" : "Selanjutnya"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
