param(
  [int]$Port = 8765,
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'application/javascript; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.txt'   = 'text/plain; charset=utf-8'
  '.md'    = 'text/plain; charset=utf-8'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.gif'   = 'image/gif'
  '.webp'  = 'image/webp'
  '.svg'   = 'image/svg+xml'
  '.ico'   = 'image/x-icon'
  '.pdf'   = 'application/pdf'
  '.mp4'   = 'video/mp4'
  '.webm'  = 'video/webm'
  '.mov'   = 'video/quicktime'
  '.ppt'   = 'application/vnd.ms-powerpoint'
  '.pptx'  = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  '.doc'   = 'application/msword'
  '.docx'  = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  '.zip'   = 'application/zip'
  '.woff2' = 'font/woff2'
}

$rootFull = [System.IO.Path]::GetFullPath($Root)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving: $rootFull"
Write-Host "URL:     http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($rel -eq '/' -or $rel -eq '') { $rel = '/index.html' }
      $file = [System.IO.Path]::GetFullPath((Join-Path $rootFull ($rel -replace '/', '\')))

      if (-not $file.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $ctx.Response.StatusCode = 403
      }
      elseif (Test-Path -LiteralPath $file -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $ct = $mime[$ext]
        if (-not $ct) { $ct = 'application/octet-stream' }
        $ctx.Response.ContentType = $ct
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
      else {
        $ctx.Response.StatusCode = 404
      }
    }
    catch {
      try { $ctx.Response.StatusCode = 500 } catch { }
    }
    finally {
      try { $ctx.Response.Close() } catch { }
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
