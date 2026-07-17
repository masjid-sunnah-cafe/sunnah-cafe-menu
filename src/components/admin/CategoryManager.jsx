import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCategory, deleteCategory, updateCategory } from '../../hooks/useAdmin'
import { useAdminLang } from '../../lib/adminLang'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const emptyLabel = () => ({ EN: '', FI: '', SO: '' })

export default function CategoryManager({ categories, dishes, open, onClose, onChanged }) {
  const { t } = useAdminLang()
  const [editing, setEditing] = useState(null)
  const [label, setLabel] = useState(emptyLabel)
  const [saving, setSaving] = useState(false)

  function startAdd() {
    setEditing(null)
    setLabel(emptyLabel())
  }

  function startEdit(category) {
    setEditing(category)
    setLabel({ ...category.label })
  }

  function setLanguage(language, value) {
    setLabel((previous) => ({ ...previous, [language]: value }))
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const category = editing
        ? await updateCategory(editing.id, label)
        : await createCategory(label)
      onChanged(category, Boolean(editing))
      toast.success(editing ? t.categoryUpdated : t.categoryAdded)
      startAdd()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save category')
    } finally {
      setSaving(false)
    }
  }

  async function remove(category) {
    if (dishes.some((dish) => dish.category === category.id)) {
      toast.error(t.categoryInUse)
      return
    }
    setSaving(true)
    try {
      await deleteCategory(category.id)
      onChanged(category, false, true)
      toast.success(t.categoryDeleted)
      if (editing?.id === category.id) startAdd()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.categoryInUse)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-6">
        <DialogTitle>{t.categoryManager}</DialogTitle>
        <DialogDescription className="sr-only">{t.manageCategories}</DialogDescription>

        <div className="mt-5 space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-border bg-brand-bg px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-text-dark">{category.label.EN}</p>
                <p className="truncate text-xs text-brand-text-muted">{category.label.FI} / {category.label.SO}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(category)} title={t.editCategory}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={saving} onClick={() => remove(category)} title={t.deleteCategory}>
                  <Trash2 className="h-4 w-4 text-brand-red" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={save} className="mt-5 border-t border-brand-border pt-5">
          <p className="mb-3 text-sm font-semibold text-brand-text-dark">{editing ? t.editCategory : t.addCategory}</p>
          <div className="space-y-3">
            {['EN', 'FI', 'SO'].map((language) => (
              <div key={language}>
                <Label htmlFor={`category-${language}`}>{t.categoryName} ({language})</Label>
                <Input
                  id={`category-${language}`}
                  className="mt-1"
                  value={label[language]}
                  onChange={(event) => setLanguage(language, event.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            {editing && <Button type="button" variant="outline" onClick={startAdd}>{t.cancel}</Button>}
            <Button type="submit" variant="brand" className="ml-auto gap-2" disabled={saving}>
              <Plus className="h-4 w-4" /> {editing ? t.saveChanges : t.addCategory}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}