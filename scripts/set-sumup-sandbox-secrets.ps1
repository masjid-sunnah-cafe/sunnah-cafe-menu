$projectRef = 'naezennshkfgwjwjwlnz'
$merchantCode = 'MREVM67B'
$publicSiteUrl = 'http://127.0.0.1:5173'
$supabaseCli = Join-Path $PSScriptRoot '..\node_modules\.bin\supabase.cmd'

if (-not (Test-Path $supabaseCli)) {
  throw 'Supabase CLI is missing. Run npm install first.'
}

$secureApiKey = Read-Host 'Paste the SumUp sandbox API key' -AsSecureString
$apiKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureApiKey)

try {
  $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($apiKeyPointer)
  if ([string]::IsNullOrWhiteSpace($apiKey)) {
    throw 'A SumUp API key is required.'
  }

  & $supabaseCli secrets set --project-ref $projectRef `
    "SUMUP_API_KEY=$apiKey" `
    "SUMUP_MERCHANT_CODE=$merchantCode" `
    "PUBLIC_SITE_URL=$publicSiteUrl"
} finally {
  if ($apiKeyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiKeyPointer)
  }
  $apiKey = $null
}