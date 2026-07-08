import { useState } from 'react'
import zahiibaLogo from '../../assets/images/Zahiiba.png'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { login } from '../../hooks/useAdmin'
import { ChefHat, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(password)
      onLogin()
    } catch {
      toast.error('Wrong password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0L60 30L30 60L0 30zM30 10L50 30L30 50L10 30z' stroke='%23D9A752' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-brand-card shadow-2xl shadow-black/40">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-gold via-brand-orange to-brand-red" />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-brand-gold shadow-lg">
                <img src={zahiibaLogo} alt="Zahiiba" className="h-full w-full object-cover" />
              </div>
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-brand-dark">Zahiiba</h1>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-brand-text-muted">
                  <ChefHat className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-widest">Kitchen Dashboard</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Kitchen password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  className="mt-2 h-12 text-base"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="h-12 w-full rounded-2xl text-base"
              >
                {loading ? 'Entering…' : 'Enter kitchen →'}
              </Button>
            </form>

            <p className="mt-6 text-center text-[11px] text-brand-text-muted">
              This area is for Zahiiba staff only.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">Zahiiba Admin · {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
