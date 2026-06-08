Write-Host "Running /api/seed..."
Invoke-RestMethod -Uri "http://localhost:3000/api/seed" -Method Get -TimeoutSec 120 | ConvertTo-Json

Write-Host "Running /api/seed-about..."
Invoke-RestMethod -Uri "http://localhost:3000/api/seed-about" -Method Get -TimeoutSec 120 | ConvertTo-Json

Write-Host "Running /api/migrate-news..."
Invoke-RestMethod -Uri "http://localhost:3000/api/migrate-news" -Method Get -TimeoutSec 300 | ConvertTo-Json

Write-Host "All imports finished!"
