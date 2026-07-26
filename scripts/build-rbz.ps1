$zipPath = "public\aisoft_render.rbz"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Add loader
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "sketchup-plugin\aisoft_render.rb", "aisoft_render.rb")

# Add folder files
$rootLen = (Get-Item "sketchup-plugin").FullName.Length + 1
Get-ChildItem -Path "sketchup-plugin\aisoft_render" -Recurse | ForEach-Object {
    if (-not $_.PSIsContainer) {
        $relPath = $_.FullName.Substring($rootLen).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath)
    }
}

$zip.Dispose()
Copy-Item $zipPath "aisoft_render.rbz" -Force
Write-Host "Successfully packaged aisoft_render.rbz with forward slashes!"
