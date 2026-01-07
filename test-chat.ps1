$body = @{
    message = "你好，请简单介绍一下自己"
    userId = "test_user"
} | ConvertTo-Json

Write-Host "测试聊天 API..." -ForegroundColor Cyan
Write-Host "发送请求到: http://localhost:3000/chat" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "`n✅ 响应成功!" -ForegroundColor Green
    Write-Host "`n响应内容:" -ForegroundColor Cyan
    Write-Host $response.Content
} catch {
    Write-Host "`n❌ 请求失败: $_" -ForegroundColor Red
}
