import { supabase } from '../lib/supabase'
import type { OrderingMode } from '../lib/types'

const fallbackMode: OrderingMode = 'approval_required'

export async function getOrderingMode(): Promise<OrderingMode> {
  if (!supabase) return fallbackMode
  const { data, error } = await supabase
    .from('ordering_settings')
    .select('mode')
    .eq('id', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.mode || fallbackMode) as OrderingMode
}

export async function setOrderingMode(mode: OrderingMode): Promise<void> {
  if (!supabase) throw new Error('Ordering settings require a configured Supabase project.')
  const { error } = await supabase.rpc('set_ordering_mode', { target_mode: mode })
  if (error) throw new Error(error.message)
}