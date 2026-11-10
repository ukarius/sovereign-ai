$body = @{
    email = "test@sovereign.local"
    password = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
} catch {
    Write-Output "Status Code: $($_.Exception.Response.StatusCode)"
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $ErrResp = $streamReader.ReadToEnd()
    $streamReader.Close()
    Write-Output "Error Response: $ErrResp"
}
