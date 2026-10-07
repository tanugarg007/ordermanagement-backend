$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
Set-Location 'c:\Users\DEEP\Documents\trae_projects\ordermanagment\backend'

$bytes = [byte[]](0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41,0x54,0x08,0xD7,0x63,0x68,0x00,0x00,0x00,0x82,0x00,0x81,0xE2,0xFE,0x14,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82)
Set-Content -Path 'testitem.png' -Value $bytes -Encoding Byte

Add-Type -AssemblyName System.Net.Http

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

Write-Step '1) GET / - metadata'
try {
  $r = Invoke-RestMethod 'http://127.0.0.1:5000/' -Method GET -TimeoutSec 5
  $r | ConvertTo-Json -Depth 6
} catch {
  Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
}

Write-Step '2) Register'
$rand = Get-Random
$email = "user$rand@shop.app"
$regBody = @{ name='ShopUser'; email=$email; password='mypassword123' } | ConvertTo-Json
$reg = $null
try {
  $reg = Invoke-RestMethod 'http://127.0.0.1:5000/api/register' -Method POST -Body $regBody -ContentType 'application/json' -TimeoutSec 8
  $reg | ConvertTo-Json -Depth 5
} catch {
  Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
  if ($_.ErrorDetails) { Write-Host "BODY: $($_.ErrorDetails.Message)" } else { Write-Host "ERR: $($_.Exception.Message)" }
}
$token = ''
if ($reg -and $reg.token) { $token = $reg.token; Write-Host "Got JWT token length=$($token.Length)" }

function New-MultipartContent($fields, $imagePath) {
  $content = New-Object System.Net.Http.MultipartFormDataContent
  foreach ($k in $fields.Keys) {
    $content.Add((New-Object System.Net.Http.StringContent($fields[$k])), $k)
  }
  if ($imagePath) {
    $raw = [byte[]](Get-Content $imagePath -Encoding Byte -ReadCount 0)
    $fc = New-Object System.Net.Http.ByteArrayContent(,$raw)
    $fc.Headers.ContentType = 'image/png'
    $name = Split-Path $imagePath -Leaf
    $content.Add($fc, 'image', $name)
  }
  return $content
}

Write-Step '3) POST without auth -> 401 expected'
$client = New-Object System.Net.Http.HttpClient
try {
  $f = @{name='Mouse';price='19.99';quantity='50';category='Electronics';status='In Stock'}
  $c = New-MultipartContent $f 'testitem.png'
  $resp = $client.PostAsync('http://127.0.0.1:5000/api/items', $c).Result
  Write-Host "STATUS: $([int]$resp.StatusCode)"
  $s = $resp.Content.ReadAsStringAsync().Result
  Write-Host "BODY: $s"
} catch { Write-Host "ERR: $($_.Exception.Message)" } finally { $client.Dispose() }

Write-Step '4) POST /api/items WITH auth + multipart PNG file -> expect 201'
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue('Bearer', $token)
try {
  $f = @{name='RGB Keyboard';price='89.50';quantity='25';category='Electronics';status='In Stock'}
  $c = New-MultipartContent $f 'testitem.png'
  $resp = $client.PostAsync('http://127.0.0.1:5000/api/items', $c).Result
  Write-Host "STATUS: $([int]$resp.StatusCode)"
  $s = $resp.Content.ReadAsStringAsync().Result
  Write-Host "BODY: $s"
} catch { Write-Host "ERR: $($_.Exception.Message)" } finally { $client.Dispose() }

Write-Step '5) GET /api/items - list items'
try {
  Invoke-RestMethod 'http://127.0.0.1:5000/api/items' -Method GET -TimeoutSec 5 | ConvertTo-Json -Depth 6
} catch {
  Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
  if ($_.ErrorDetails) { Write-Host "BODY: $($_.ErrorDetails.Message)" }
}

Remove-Item testitem.png -ErrorAction SilentlyContinue
