import { LANGS, UI } from '../data/i18n'
import { Button } from './ui/button'

export default function Header({ lang, onLangChange }) {
  return (
    <header className="border-b-2 border-[#A97943] bg-[#D9B17C] px-5 py-5 md:px-8 md:py-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo & info */}
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="h-14 w-[92px] flex-none overflow-hidden rounded-md border border-white/70 bg-[#F7E8D5] shadow-sm md:h-16 md:w-[108px]">
            <img src="/images/sunnah-cafe-logo.png" alt="Sunnah Cafe" className="h-full w-full object-cover object-center" />
          </div>
          <div>
            <h1 className="font-display text-[27px] font-bold leading-tight text-[#3A2A1B] md:text-[31px]">
              Sunnah Cafe
            </h1>
            <p className="text-[12px] font-medium leading-snug text-[#62472F] md:text-[13px]">
              {UI.subtitle[lang].split(' · ')[0]} ·
              <br className="sm:hidden" />
              <span className="sm:ml-0"> {UI.subtitle[lang].split(' · ')[1]}</span>
            </p>
          </div>
        </div>

        {/* Language switcher pill */}
        <div className="flex items-center rounded-full border border-[#8D6133]/50 bg-[#F7E8D5] p-1 shadow-sm">
          {LANGS.map((code) => (
            <Button
              key={code}
              type="button"
              variant={code === lang ? 'lang-active' : 'outline'}
              size="icon"
              onClick={() => onLangChange(code)}
              className="h-8 w-8 border-0 text-[12px] md:h-10 md:w-10 md:text-[13px]"
            >
              {code}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
