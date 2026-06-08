# Lightweight .NET static file server for PowerShell
$port = 3000
$root = "C:\Users\acer\.gemini\antigravity-ide\scratch\restaurant-website"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Output "Listening on http://localhost:$port..."
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") { 
            $urlPath = "/index.html" 
        }
        
        # Replace URL slashes with system folder separators
        $urlPath = $urlPath.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        # Trim leading separators for Join-Path safety
        if ($urlPath.StartsWith([System.IO.Path]::DirectorySeparatorChar)) {
            $urlPath = $urlPath.Substring(1)
        }
        
        $filePath = Join-Path $root $urlPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            
            # Simple content types
            if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
            
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $urlPath")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} catch {
    Write-Error "Error starting listener: $_"
} finally {
    if ($listener) {
        $listener.Close()
    }
}
