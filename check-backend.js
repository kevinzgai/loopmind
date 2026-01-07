import WebSocket from 'ws';

console.log('🔍 检查后端 WebSocket 服务...\n');

// 测试直接连接
console.log('测试 1: 直接连接 ws://localhost:3000/asr/stream');

const ws = new WebSocket('ws://localhost:3000/asr/stream');

ws.on('open', () => {
    console.log('✅ WebSocket 连接成功！');
    console.log('📊 ReadyState:', ws.readyState);
    console.log('🔗 URL:', ws.url);
    
    // 等待接收消息
    setTimeout(() => {
        console.log('\n✅ 后端 WebSocket 服务正常运行');
        ws.close();
        process.exit(0);
    }, 2000);
});

ws.on('message', (data) => {
    console.log('📨 收到消息:', data.toString());
});

ws.on('error', (error) => {
    console.error('❌ WebSocket 连接失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 后端未启动');
    console.error('2. 后端未重启（还在运行旧代码）');
    console.error('3. WebSocket 路径配置错误');
    console.error('\n解决方法:');
    console.error('1. 检查后端是否启动: curl http://localhost:3000/health');
    console.error('2. 重启后端服务');
    console.error('3. 检查后端日志是否有 "Ali ASR Stream WebSocket service"');
    process.exit(1);
});

ws.on('close', (code, reason) => {
    console.log('🔌 连接已关闭');
    console.log('Code:', code);
    console.log('Reason:', reason.toString());
});

// 超时检查
setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) {
        console.error('\n❌ 连接超时');
        console.error('后端可能未启动或未重启');
        ws.close();
        process.exit(1);
    }
}, 5000);
