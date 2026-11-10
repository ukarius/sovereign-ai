$body = @{
    name = "Sovereign Test User"
    email = "test@sovereign.local"
    password = "password123"
    role = "CREATOR"
    niche = "Elite Creator"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
