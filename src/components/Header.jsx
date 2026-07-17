import { LANGS, UI } from '../data/i18n'
import { Button } from './ui/button'

export default function Header({ lang, onLangChange }) {
  return (
    <header className="relative overflow-hidden bg-brand-dark px-5 pb-5 pt-8 md:px-8 md:pb-6 md:pt-10">
      {/* Heritage Pattern Background */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[70%] opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0L60 30L30 60L0 30zM30 10L50 30L30 50L10 30z' stroke='%23D9A752' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          backgroundPosition: 'right center',
          maskImage: 'linear-gradient(to right, transparent, black 40%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)',
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo & info */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full border-[2.5px] border-brand-gold bg-brand-dark font-display text-lg font-bold text-brand-gold shadow-lg shadow-black/30 md:h-16 md:w-16">
            SC
          </div>
          <div>
            <h1 className="font-display text-[26px] font-bold leading-tight text-white md:text-3xl">
              Sunnah Cafe
            </h1>
            <p className="text-[12px] leading-snug text-brand-gold md:text-[13px]">
              {UI.subtitle[lang].split(' · ')[0]} ·
              <br className="sm:hidden" />
              <span className="sm:ml-0"> {UI.subtitle[lang].split(' · ')[1]}</span>
            </p>
          </div>
        </div>

        {/* Language switcher pill */}
        <div className="flex items-center rounded-full border border-brand-gold/50 bg-brand-dark p-1">
          {LANGS.map((code) => (
            <Button
              key={code}
              type="button"
              variant={code === lang ? 'lang-active' : 'lang-inactive'}
              size="icon"
              onClick={() => onLangChange(code)}
              className="text-[12px] md:h-10 md:w-10 md:text-[13px]"
            >
              {code}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
