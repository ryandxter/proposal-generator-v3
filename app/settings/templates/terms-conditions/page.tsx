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

interface TermsCondition {
  id: string
  name: string
  content: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export default function TermsConditionsPage() {
  const { toast } = useToast()
  const [terms, setTerms] = useState<TermsCondition[]>([])
  const [editingTerm, setEditingTerm] = useState<TermsCondition | null>(null)
  const [newTermName, setNewTermName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from("terms_condition_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTerms(data || [])
    } catch (error) {
      console.error("Error fetching terms:", error)
      toast({
        title: "Error",
        description: "Gagal memuat template syarat & ketentuan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingTerm) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("terms_condition_templates")
        .update({
          name: editingTerm.name,
          content: editingTerm.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTerm.id)

      if (error) throw error

      await fetchTerms()
      setEditingTerm(null)
      toast({
        title: "Berhasil",
        description: "Template syarat & ketentuan berhasil disimpan",
      })
    } catch (error) {
      console.error("Error saving term:", error)
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
    if (!newTermName.trim()) return

    try {
      const { data, error } = await supabase
        .from("terms_condition_templates")
        .insert({
          name: newTermName,
          content: "",
          is_default: false,
        })
        .select()
        .single()

      if (error) throw error

      await fetchTerms()
      setEditingTerm(data)
      setNewTermName("")
      toast({
        title: "Berhasil",
        description: "Template baru berhasil dibuat",
      })
    } catch (error) {
      console.error("Error adding term:", error)
      toast({
        title: "Error",
        description: "Gagal membuat template baru",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("terms_condition_templates").delete().eq("id", id)

      if (error) throw error

      await fetchTerms()
      if (editingTerm?.id === id) {
        setEditingTerm(null)
      }
      toast({
        title: "Berhasil",
        description: "Template berhasil dihapus",
      })
    } catch (error) {
      console.error("Error deleting term:", error)
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
        <h1 className="text-3xl font-bold">Syarat & Ketentuan</h1>
        <p className="text-muted-foreground">Kelola template syarat dan ketentuan layanan</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle>Template Syarat & Ketentuan</CardTitle>
            <CardDescription>Daftar template yang tersedia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nama template baru"
                value={newTermName}
                onChange={(e) => setNewTermName(e.target.value)}
              />
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {terms.map((term) => (
                <div
                  key={term.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => setEditingTerm(term)}
                >
                  <div>
                    <p className="font-medium">{term.name}</p>
                    {term.is_default && <p className="text-xs text-muted-foreground">Default</p>}
                  </div>
                  <div className="flex gap-1">
                    {!term.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(term.id)
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
        {editingTerm && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
              <CardDescription>Edit konten template syarat & ketentuan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nama Template</Label>
                <Input
                  id="template-name"
                  value={editingTerm.name}
                  onChange={(e) => setEditingTerm({ ...editingTerm, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="template-content">Konten</Label>
                <Textarea
                  id="template-content"
                  rows={15}
                  value={editingTerm.content}
                  onChange={(e) => setEditingTerm({ ...editingTerm, content: e.target.value })}
                  placeholder="Masukkan syarat dan ketentuan..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setEditingTerm(null)}>
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
