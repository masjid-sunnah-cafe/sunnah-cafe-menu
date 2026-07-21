import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ADMIN_LANG_NAMES, ADMIN_LANGS, makeT } from '../i18n/adminStrings'

const STORAGE_KEY = 'zahiiba-admin-lang'

function readSaved() {
  const v = localStorage.getItem(STORAGE_KEY)
  return ADMIN_LANGS.includes(v) ? v : 'FI'
}

const AdminLangContext = createContext(null)

export function AdminLangProvider({ children }) {
  const [lang, setLangState] = useState(readSaved)

  const setLang = useCallback((l) => {
    localStorage.setItem(STORAGE_KEY, l)
    setLangState(l)
  }, [])

  const t = useMemo(() => makeT(lang), [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>
}

export function useAdminLang() {
  const ctx = useContext(AdminLangContext)
  if (!ctx) throw new Error('useAdminLang must be used within an AdminLangProvider')
  return ctx
}

/** Small inline FI/EN switcher for the admin header and login screen. */
export function AdminLangSwitcher({ className = '' }) {
  const { lang, setLang } = useAdminLang()
  return (
    <div className={'flex items-center rounded-full border border-brand-gold/60 bg-brand-bg p-0.5 ' + className}>
      {ADMIN_LANGS.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={code === lang}
          aria-label={ADMIN_LANG_NAMES[code]}
          onClick={() => setLang(code)}
          className={
            'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors ' +
            (code === lang
              ? 'bg-brand-gold text-brand-dark shadow-sm'
              : 'text-brand-text-muted hover:text-brand-text-dark')
          }
        >
          {code}
        </button>
      ))}
    </div>
  )
}
