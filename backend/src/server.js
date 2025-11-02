import app from './app.js';
import { PORT } from './config/config.js';

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});