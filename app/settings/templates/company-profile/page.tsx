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

interface CompanyProfile {
  id: string
  name: string
  content: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export default function CompanyProfilePage() {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<CompanyProfile[]>([])
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null)
  const [newProfileName, setNewProfileName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profile_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast({
        title: "Error",
        description: "Gagal memuat template company profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingProfile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("company_profile_templates")
        .update({
          name: editingProfile.name,
          content: editingProfile.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProfile.id)

      if (error) throw error

      await fetchProfiles()
      setEditingProfile(null)
      toast({
        title: "Berhasil",
        description: "Template company profile berhasil disimpan",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
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
    if (!newProfileName.trim()) return

    try {
      const { data, error } = await supabase
        .from("company_profile_templates")
        .insert({
          name: newProfileName,
          content: "",
          is_default: false,
        })
        .select()
        .single()

      if (error) throw error

      await fetchProfiles()
      setEditingProfile(data)
      setNewProfileName("")
      toast({
        title: "Berhasil",
        description: "Template baru berhasil dibuat",
      })
    } catch (error) {
      console.error("Error adding profile:", error)
      toast({
        title: "Error",
        description: "Gagal membuat template baru",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("company_profile_templates").delete().eq("id", id)

      if (error) throw error

      await fetchProfiles()
      if (editingProfile?.id === id) {
        setEditingProfile(null)
      }
      toast({
        title: "Berhasil",
        description: "Template berhasil dihapus",
      })
    } catch (error) {
      console.error("Error deleting profile:", error)
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
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">Kelola template pembuka dan profil perusahaan</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle>Template Company Profile</CardTitle>
            <CardDescription>Daftar template yang tersedia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nama template baru"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => setEditingProfile(profile)}
                >
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    {profile.is_default && <p className="text-xs text-muted-foreground">Default</p>}
                  </div>
                  <div className="flex gap-1">
                    {!profile.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(profile.id)
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
        {editingProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
              <CardDescription>Edit konten template company profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nama Template</Label>
                <Input
                  id="template-name"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="template-content">Konten</Label>
                <Textarea
                  id="template-content"
                  rows={15}
                  value={editingProfile.content}
                  onChange={(e) => setEditingProfile({ ...editingProfile, content: e.target.value })}
                  placeholder="Masukkan konten company profile..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
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
