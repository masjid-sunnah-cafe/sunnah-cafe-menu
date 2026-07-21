$projectRef = 'naezennshkfgwjwjwlnz'
$publicSiteUrl = 'https://cafe.masjidsunnah.fi'
$supabaseCli = Join-Path $PSScriptRoot '..\node_modules\.bin\supabase.cmd'

if (-not (Test-Path $supabaseCli)) {
  throw 'Supabase CLI is missing. Run npm install first.'
}

$secureApiKey = Read-Host 'Paste the SumUp LIVE API key' -AsSecureString
$secureMerchantCode = Read-Host 'Paste the SumUp LIVE merchant code' -AsSecureString
$apiKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureApiKey)
$merchantCodePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureMerchantCode)

try {
  $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($apiKeyPointer)
  $merchantCode = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($merchantCodePointer)

  if ([string]::IsNullOrWhiteSpace($apiKey) -or [string]::IsNullOrWhiteSpace($merchantCode)) {
    throw 'A SumUp API key and merchant code are required.'
  }

  & $supabaseCli secrets set --project-ref $projectRef `
    "SUMUP_API_KEY=$apiKey" `
    "SUMUP_MERCHANT_CODE=$merchantCode" `
    "PUBLIC_SITE_URL=$publicSiteUrl"
} finally {
  if ($apiKeyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiKeyPointer)
  }
  if ($merchantCodePointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($merchantCodePointer)
  }
  $apiKey = $null
  $merchantCode = $null
}