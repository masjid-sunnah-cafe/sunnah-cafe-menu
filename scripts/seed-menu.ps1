param([switch]$FromClipboard)

$serviceKeyPointer = [IntPtr]::Zero
$previousServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

try {
  if ($FromClipboard) {
    $env:SUPABASE_SERVICE_ROLE_KEY = (Get-Clipboard -Raw).Trim()
  } else {
    $secureServiceKey = Read-Host 'Paste the Supabase Secret key for this one-time menu import' -AsSecureString
    $serviceKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureServiceKey)
    $env:SUPABASE_SERVICE_ROLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($serviceKeyPointer).Trim()
  }

  if ([string]::IsNullOrWhiteSpace($env:SUPABASE_SERVICE_ROLE_KEY)) {
    throw 'A Supabase Secret key is required.'
  }

  node scripts/seed.mjs
} finally {
  if ($serviceKeyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($serviceKeyPointer)
  }
  $env:SUPABASE_SERVICE_ROLE_KEY = $previousServiceKey
}