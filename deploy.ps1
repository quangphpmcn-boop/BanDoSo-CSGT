$src = "H:\Bandoso"
$deploy = "H:\BanDoSo-Deploy"

# Clean
if (Test-Path $deploy) { Remove-Item $deploy -Recurse -Force }
New-Item $deploy -ItemType Directory | Out-Null
New-Item "$deploy\css" -ItemType Directory | Out-Null
New-Item "$deploy\js" -ItemType Directory | Out-Null
New-Item "$deploy\data" -ItemType Directory | Out-Null

# Copy only needed files
Copy-Item "$src\index.html" "$deploy\"
Copy-Item "$src\css\styles.css" "$deploy\css\"
Copy-Item "$src\js\app.js" "$deploy\js\"

# Data (exclude backups)
$dataFiles = @(
    "demographics.json",
    "haiphong-boundary.geojson",
    "haiphong-roads.geojson",
    "haiphong-wards.geojson",
    "haiphong-waterways.geojson",
    "units.json",
    "ward-demographics.json",
    "ward-unit-mapping.json",
    "waterway-unit-mapping.json"
)
foreach ($f in $dataFiles) {
    Copy-Item "$src\data\$f" "$deploy\data\"
}

# Init git
Set-Location $deploy
git init
git add -A
git commit -m "feat: Ban Do So CSGT Hai Phong v1.0"
git remote add origin https://github.com/quangphpmcn-boop/BanDoSo-CSGT.git
git branch -M main
git push -u origin main --force

Write-Host "`nDone! Check: https://github.com/quangphpmcn-boop/BanDoSo-CSGT"
