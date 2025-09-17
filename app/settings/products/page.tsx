"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  cogs: number // HPP (Harga Pokok Penjualan)
  category: string
  created_at?: string
  updated_at?: string
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Gagal memuat produk/layanan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSave = async () => {
    if (!editingProduct) return

    setIsSaving(true)
    try {
      if (editingProduct.id === "new") {
        const { error } = await supabase.from("products").insert({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          cogs: editingProduct.cogs,
          category: editingProduct.category,
        })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("products")
          .update({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            cogs: editingProduct.cogs,
            category: editingProduct.category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id)

        if (error) throw error
      }

      await fetchProducts()
      setEditingProduct(null)
      setIsDialogOpen(false)
      toast({
        title: "Berhasil",
        description: "Produk/layanan berhasil disimpan",
      })
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan produk/layanan",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      await fetchProducts()
      toast({
        title: "Berhasil",
        description: "Produk/layanan berhasil dihapus",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus produk/layanan",
        variant: "destructive",
      })
    }
  }

  const handleAddNew = () => {
    setEditingProduct({
      id: "new",
      name: "",
      description: "",
      price: 0,
      cogs: 0,
      category: "Layanan",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const calculateMargin = (price: number, cogs: number) => {
    if (price === 0) return 0
    return ((price - cogs) / price) * 100
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produk & Layanan</h1>
          <p className="text-muted-foreground">Kelola daftar produk dan layanan dengan harga dan HPP</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk/Layanan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk & Layanan</CardTitle>
          <CardDescription>HPP (Harga Pokok Penjualan) tidak akan ditampilkan dalam proposal</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>HPP</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{formatCurrency(product.cogs)}</TableCell>
                  <TableCell>{calculateMargin(product.price, product.cogs).toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id === "new" ? "Tambah" : "Edit"} Produk/Layanan</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="price">Harga Jual (IDR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="cogs">HPP - Harga Pokok Penjualan (IDR)</Label>
                <Input
                  id="cogs"
                  type="number"
                  value={editingProduct.cogs}
                  onChange={(e) => setEditingProduct({ ...editingProduct, cogs: Number(e.target.value) })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
