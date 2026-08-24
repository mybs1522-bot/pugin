$zipPath = "public\v6_render.rbz"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Add loader
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "sketchup-plugin\v6_render.rb", "v6_render.rb")

# Add folder files
$rootLen = (Get-Item "sketchup-plugin").FullName.Length + 1
Get-ChildItem -Path "sketchup-plugin\v6_render" -Recurse | ForEach-Object {
    if (-not $_.PSIsContainer) {
        $relPath = $_.FullName.Substring($rootLen).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath)
    }
}

$zip.Dispose()
Copy-Item $zipPath "v6_render.rbz" -Force
Copy-Item $zipPath "public\aisoft_render.rbz" -Force
Copy-Item $zipPath "aisoft_render.rbz" -Force
Write-Host "Successfully packaged v6_render.rbz with forward slashes!"
