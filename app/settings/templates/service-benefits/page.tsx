"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ServiceBenefit {
  id: string
  name: string
  content: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export default function ServiceBenefitsPage() {
  const { toast } = useToast()
  const [benefits, setBenefits] = useState<ServiceBenefit[]>([])
  const [editingBenefit, setEditingBenefit] = useState<ServiceBenefit | null>(null)
  const [newBenefitName, setNewBenefitName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchBenefits()
  }, [])

  const fetchBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from("service_benefit_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setBenefits(data || [])
    } catch (error) {
      console.error("Error fetching benefits:", error)
      toast({
        title: "Error",
        description: "Gagal memuat template keuntungan layanan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingBenefit) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("service_benefit_templates")
        .update({
          name: editingBenefit.name,
          content: editingBenefit.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBenefit.id)

      if (error) throw error

      await fetchBenefits()
      setEditingBenefit(null)
      toast({
        title: "Berhasil",
        description: "Template keuntungan layanan berhasil disimpan",
      })
    } catch (error) {
      console.error("Error saving benefit:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan template",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNew = async () => {
    if (!newBenefitName.trim()) return

    try {
      const { data, error } = await supabase
        .from("service_benefit_templates")
        .insert({
          name: newBenefitName,
          content: "",
          is_default: false,
        })
        .select()
        .single()

      if (error) throw error

      await fetchBenefits()
      setEditingBenefit(data)
      setNewBenefitName("")
      toast({
        title: "Berhasil",
        description: "Template baru berhasil dibuat",
      })
    } catch (error) {
      console.error("Error adding benefit:", error)
      toast({
        title: "Error",
        description: "Gagal membuat template baru",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("service_benefit_templates").delete().eq("id", id)

      if (error) throw error

      await fetchBenefits()
      if (editingBenefit?.id === id) {
        setEditingBenefit(null)
      }
      toast({
        title: "Berhasil",
        description: "Template berhasil dihapus",
      })
    } catch (error) {
      console.error("Error deleting benefit:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus template",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Keuntungan Layanan</h1>
        <p className="text-muted-foreground">Kelola template keuntungan dan manfaat layanan</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle>Template Keuntungan Layanan</CardTitle>
            <CardDescription>Daftar template yang tersedia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nama template baru"
                value={newBenefitName}
                onChange={(e) => setNewBenefitName(e.target.value)}
              />
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => setEditingBenefit(benefit)}
                >
                  <div>
                    <p className="font-medium">{benefit.name}</p>
                    {benefit.is_default && <p className="text-xs text-muted-foreground">Default</p>}
                  </div>
                  <div className="flex gap-1">
                    {!benefit.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(benefit.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        {editingBenefit && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
              <CardDescription>Edit konten template keuntungan layanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nama Template</Label>
                <Input
                  id="template-name"
                  value={editingBenefit.name}
                  onChange={(e) => setEditingBenefit({ ...editingBenefit, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="template-content">Konten</Label>
                <Textarea
                  id="template-content"
                  rows={15}
                  value={editingBenefit.content}
                  onChange={(e) => setEditingBenefit({ ...editingBenefit, content: e.target.value })}
                  placeholder="Masukkan keuntungan layanan..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setEditingBenefit(null)}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
