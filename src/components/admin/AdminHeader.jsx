import { Button } from '../ui/button'
import { LogOut, ChefHat } from 'lucide-react'
import { useAdminLang, AdminLangSwitcher } from '../../lib/adminLang'

export default function AdminHeader({ dishCount, onLogout }) {
  const { t } = useAdminLang()
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border/60 bg-brand-dark px-5 py-3 shadow-lg md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-gold/40 font-display text-xs font-bold text-brand-gold">
            SC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-brand-gold" />
              <span className="font-display font-bold text-white text-sm md:text-base">{t.dashboard}</span>
            </div>
            <p className="text-[11px] text-brand-gold/70">{t.dishesTotal(dishCount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminLangSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
