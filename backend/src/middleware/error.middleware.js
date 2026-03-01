// 错误处理中间件
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    
    // 检查响应是否已经发送
    if (res.headersSent) {
        return next(err);
    }
    
    // 发送错误响应
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
}