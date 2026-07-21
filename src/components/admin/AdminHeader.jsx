import { Button } from '../ui/button'
import { LogOut, ChefHat } from 'lucide-react'
import { useAdminLang, AdminLangSwitcher } from '../../lib/adminLang'

export default function AdminHeader({ dishCount, onLogout }) {
  const { t } = useAdminLang()
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-white px-5 py-3 shadow-sm md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 overflow-hidden rounded-md border border-brand-border bg-brand-bg">
            <img src="/images/sunnah-cafe-logo.png" alt="Sunnah Cafe" className="h-full w-full object-cover object-center" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-brand-gold" />
              <span className="font-display text-sm font-bold text-brand-text-dark md:text-base">{t.dashboard}</span>
            </div>
            <p className="text-[11px] text-brand-text-muted">{t.dishesTotal(dishCount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminLangSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-brand-text-muted hover:bg-brand-bg hover:text-brand-text-dark"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
