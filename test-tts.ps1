$body = @{
    text = "Hello, this is a test"
    voice = "nova"
    speed = 1.0
} | ConvertTo-Json

Write-Host "Testing TTS API..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/tts" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Success! Audio size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save audio file
    [System.IO.File]::WriteAllBytes("test-output.mp3", $response.Content)
    Write-Host "Audio saved to test-output.mp3" -ForegroundColor Green
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
}
