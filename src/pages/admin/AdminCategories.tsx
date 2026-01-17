import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ImageIcon,
  FolderOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* =======================
   TYPES
======================= */
interface CategoryFormData {
  slug: string;
  name: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  slug: "",
  name: "",
  description: "",
  image_url: "",
  display_order: 0,
  is_active: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  /* =======================
     FETCH
  ======================= */
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =======================
     HELPERS
  ======================= */
  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        slug: category.slug,
        name: category.name,
        description: category.description || "",
        image_url: category.image_url || "",
        display_order: category.display_order,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({ ...initialFormData, display_order: categories.length + 1 });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name & slug required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        description: formData.description || null,
        image_url: formData.image_url || null,
      };

      if (editingCategory) {
        await supabase.from("categories").update(payload).eq("id", editingCategory.id);
        toast.success("Category updated");
      } else {
        await supabase.from("categories").insert([payload]);
        toast.success("Category added");
      }

      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Deleted");
    fetchCategories();
  };

  const toggleActive = async (category: Category) => {
    await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);
    fetchCategories();
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="container-wide py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-3xl font-bold">Categories</h1>
        <Button className="btn-primary" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : categories.length ? (
        <div className="space-y-3">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border rounded-xl p-3"
            >
              {/* ROW 1 */}
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />

                {/* Image */}
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {category.image_url ? (
                    <img src={category.image_url} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-4 w-4 m-auto text-muted-foreground" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{category.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {category.slug}
                  </p>
                </div>

                <Switch
                  checked={category.is_active}
                  onCheckedChange={() => toggleActive(category)}
                />
              </div>

              {/* ROW 2 – actions */}
              <div className="flex justify-end gap-2 mt-2">
                <Button size="icon" variant="outline" onClick={() => handleOpenDialog(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border rounded-xl">
          <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p>No categories yet</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  name: e.target.value,
                  slug: editingCategory ? p.slug : generateSlug(e.target.value),
                }))
              }
            />
            <Input
              placeholder="Slug"
              value={formData.slug}
              onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
            <Input
              placeholder="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData((p) => ({ ...p, image_url: e.target.value }))}
            />

            <div className="flex justify-between items-center">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) =>
                  setFormData((p) => ({ ...p, is_active: v }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
