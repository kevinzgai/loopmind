import https from 'https';
// 确保环境变量已加载
import '../config/config.js';
import { getToken } from './aliTokenService.js';

/**
 * 阿里云 TTS 服务
 * 使用 RESTful API 调用
 * 文档: https://help.aliyun.com/document_detail/94737.html
 */

// 从环境变量获取配置（延迟读取以确保 dotenv 已加载）
function getConfig() {
    return {
        appKey: process.env.ALI_TTS_APP_KEY || ''
    };
}

/**
 * 语音合成（使用 RESTful API）
 */
export async function textToSpeech(text, options = {}) {
    try {
        // 获取配置
        const { appKey } = getConfig();
        
        // 检查配置
        if (!checkConfig()) {
            throw new Error('阿里云 TTS 服务未配置，请在 .env 文件中添加配置');
        }

        // 获取 Token
        const { token } = await getToken();

        const {
            voice = 'xiaoyun',
            format = 'mp3',
            sampleRate = 16000,
            volume = 50,
            speechRate = 0,
            pitchRate = 0
        } = options;

        console.log('🔊 阿里云 TTS 开始转换:', { 
            text: text.substring(0, 50), 
            voice, 
            format,
            appKey: appKey.substring(0, 8) + '...'
        });

        // 使用 POST 方法（推荐）
        const bodyContent = JSON.stringify({
            appkey: appKey,
            token: token,
            text: text,
            format: format,
            sample_rate: sampleRate,
            voice: voice,
            volume: volume,
            speech_rate: speechRate,
            pitch_rate: pitchRate
        });

        const url = 'https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts';

        // 发送 POST 请求
        const audioBuffer = await new Promise((resolve, reject) => {
            const postData = bodyContent;
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(url, options, (res) => {
                const chunks = [];
                
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const contentType = res.headers['content-type'];
                    
                    // 检查响应类型
                    if (contentType && contentType.includes('audio/mpeg')) {
                        resolve(buffer);
                    } else {
                        // 错误响应
                        const errorText = buffer.toString('utf-8');
                        console.error('❌ API 错误响应:', errorText);
                        reject(new Error(`API 错误: ${errorText}`));
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.write(postData);
            req.end();
        });

        console.log('✅ 阿里云 TTS 转换成功，音频大小:', audioBuffer.length, 'bytes');
        return audioBuffer;
    } catch (error) {
        console.error('❌ 阿里云 TTS 转换失败:', error);
        throw new Error(`阿里云 TTS 服务异常: ${error.message}`);
    }
}

/**
 * 文字转语音并保存到文件
 * @param {string} text - 要转换的文字
 * @param {string} outputPath - 输出文件路径
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} 保存的文件路径
 */
export async function textToSpeechFile(text, outputPath, options = {}) {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const audioBuffer = await textToSpeech(text, options);
        
        // 确保输出目录存在
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // 保存音频文件
        fs.writeFileSync(outputPath, audioBuffer);
        
        console.log('💾 音频文件已保存:', outputPath);
        
        return outputPath;
    } catch (error) {
        console.error('❌ 保存音频文件失败:', error);
        throw new Error(`保存音频文件异常: ${error.message}`);
    }
}

/**
 * 批量文字转语音
 * @param {Array<string>} texts - 文字数组
 * @param {Object} options - 配置选项
 * @returns {Promise<Array<Buffer>>} 音频数据数组
 */
export async function batchTextToSpeech(texts, options = {}) {
    try {
        console.log('🔊 开始批量文字转语音，数量:', texts.length);
        
        const audioBuffers = await Promise.all(
            texts.map(text => textToSpeech(text, options))
        );
        
        console.log('✅ 批量文字转语音完成');
        
        return audioBuffers;
    } catch (error) {
        console.error('❌ 批量文字转语音失败:', error);
        throw new Error(`批量 TTS 服务异常: ${error.message}`);
    }
}

/**
 * 获取支持的语音列表
 * @returns {Array<Object>} 语音列表
 */
export function getSupportedVoices() {
    return [
        // 通用场景 - 标准女声
        { id: 'xiaoyun', name: '小云', type: '标准女声', scene: '通用', quality: 'lite' },
        { id: 'ruoxi', name: '若兮', type: '温柔女声', scene: '通用', quality: '标准' },
        { id: 'siqi', name: '思琪', type: '温柔女声', scene: '通用', quality: '标准' },
        { id: 'sijia', name: '思佳', type: '标准女声', scene: '通用', quality: '标准' },
        { id: 'ninger', name: '宁儿', type: '标准女声', scene: '通用', quality: '标准' },
        { id: 'ruilin', name: '瑞琳', type: '标准女声', scene: '通用', quality: '标准' },
        { id: 'zhitian', name: '知甜', type: '甜美女声', scene: '通用', quality: '精品' },
        { id: 'zhiyue', name: '知悦', type: '普通话女声', scene: '通用', quality: '标准' },
        { id: 'zhiyuan', name: '知媛', type: '普通话女声', scene: '通用', quality: '标准' },
        { id: 'stella', name: 'Stella', type: '知性女声', scene: '通用', quality: '标准' },
        { id: 'rosa', name: 'Rosa', type: '自然女声', scene: '通用', quality: '标准' },
        
        // 通用场景 - 标准男声
        { id: 'xiaogang', name: '小刚', type: '标准男声', scene: '通用', quality: 'lite' },
        { id: 'sicheng', name: '思诚', type: '标准男声', scene: '通用', quality: '标准' },
        { id: 'aicheng', name: '艾诚', type: '标准男声', scene: '通用', quality: '标准' },
        { id: 'aida', name: '艾达', type: '标准男声', scene: '通用', quality: '标准' },
        { id: 'zhida', name: '知达', type: '普通话男声', scene: '通用', quality: '标准' },
        { id: 'stanley', name: 'Stanley', type: '沉稳男声', scene: '通用', quality: '标准' },
        { id: 'kenny', name: 'Kenny', type: '沉稳男声', scene: '通用', quality: '标准' },
        
        // 客服场景
        { id: 'siyue', name: '思悦', type: '温柔女声', scene: '客服', quality: '标准' },
        { id: 'aiya', name: '艾雅', type: '严厉女声', scene: '客服', quality: '标准' },
        { id: 'aimei', name: '艾美', type: '甜美女声', scene: '客服', quality: '标准' },
        { id: 'aiyu', name: '艾雨', type: '自然女声', scene: '客服', quality: '标准' },
        { id: 'aiyue', name: '艾悦', type: '温柔女声', scene: '客服', quality: '标准' },
        { id: 'aijing', name: '艾婧', type: '严厉女声', scene: '客服', quality: '标准' },
        { id: 'xiaomei', name: '小美', type: '甜美女声', scene: '客服', quality: '标准' },
        { id: 'aina', name: '艾娜', type: '浙普女声', scene: '客服', quality: '标准' },
        { id: 'yina', name: '伊娜', type: '浙普女声', scene: '客服', quality: '标准' },
        { id: 'sijing', name: '思婧', type: '严厉女声', scene: '客服', quality: '标准' },
        { id: 'aiqi', name: '艾琪', type: '温柔女声', scene: '客服', quality: '标准' },
        { id: 'aijia', name: '艾佳', type: '标准女声', scene: '客服', quality: '标准' },
        { id: 'aishuo', name: '艾硕', type: '自然男声', scene: '客服', quality: '标准' },
        { id: 'zhiya', name: '知雅', type: '普通话女声', scene: '客服', quality: '标准' },
        { id: 'zhishuo', name: '知硕', type: '普通话男声', scene: '客服', quality: '标准' },
        { id: 'aixia', name: '艾夏', type: '普通话女声', scene: '客服', quality: '标准' },
        
        // 数字人场景
        { id: 'zhixiaobai', name: '知小白', type: '普通话女声', scene: '对话数字人', quality: '标准' },
        { id: 'zhixiaoxia', name: '知小夏', type: '普通话女声', scene: '对话数字人', quality: '标准' },
        { id: 'zhixiaomei', name: '知小妹', type: '普通话女声', scene: '直播数字人', quality: '标准' },
        { id: 'zhigui', name: '知柜', type: '普通话女声', scene: '直播数字人', quality: '标准' },
        { id: 'abin', name: '阿斌', type: '广东普通话', scene: '对话数字人', quality: '标准' },
        { id: 'cally', name: 'Cally', type: '美式英文女声', scene: '对话数字人', quality: '标准' },
        
        // 直播场景
        { id: 'guijie', name: '柜姐', type: '亲切女声', scene: '直播', quality: '标准' },
        { id: 'xiaoxian', name: '小仙', type: '亲切女声', scene: '直播', quality: '标准' },
        { id: 'maoxiaomei', name: '猫小美', type: '活力女声', scene: '直播', quality: '标准' },
        { id: 'aifei', name: '艾飞', type: '激昂解说', scene: '直播', quality: '标准' },
        { id: 'ailun', name: '艾伦', type: '悬疑解说', scene: '直播', quality: '标准' },
        { id: 'yaqun', name: '亚群', type: '卖场广播', scene: '直播', quality: '标准' },
        { id: 'qiaowei', name: '巧薇', type: '卖场广播', scene: '直播', quality: '标准' },
        { id: 'laotie', name: '老铁', type: '东北老铁', scene: '直播', quality: '标准' },
        { id: 'laomei', name: '老妹', type: '吆喝女声', scene: '直播', quality: '标准' },
        { id: 'zhimao', name: '知猫', type: '普通话女声', scene: '直播', quality: '标准' },
        
        // 童声场景
        { id: 'sitong', name: '思彤', type: '儿童音', scene: '童声', quality: '标准' },
        { id: 'xiaobei', name: '小北', type: '萝莉女声', scene: '童声', quality: '标准' },
        { id: 'aitong', name: '艾彤', type: '儿童音', scene: '童声', quality: '标准' },
        { id: 'aiwei', name: '艾薇', type: '萝莉女声', scene: '童声', quality: '标准' },
        { id: 'aibao', name: '艾宝', type: '萝莉女声', scene: '童声', quality: '标准' },
        { id: 'aiying', name: '艾颖', type: '软萌童声', scene: '童声', quality: '精品' },
        { id: 'zhibei_emo', name: '知贝（多情感）', type: '多情感童声', scene: '童声', quality: '标准' },
        { id: 'jielidou', name: '杰力豆', type: '治愈童声', scene: '童声', quality: '标准' },
        { id: 'yuer', name: '悦儿', type: '儿童剧女声', scene: '童声', quality: '标准' },
        { id: 'mashu', name: '马树', type: '儿童剧男声', scene: '童声', quality: '标准' },
        
        // 文学场景
        { id: 'aiyuan', name: '艾媛', type: '知心姐姐', scene: '文学', quality: '精品' },
        { id: 'aixiang', name: '艾祥', type: '磁性男声', scene: '文学', quality: '精品' },
        { id: 'aimo', name: '艾墨', type: '情感男声', scene: '文学', quality: '精品' },
        { id: 'aiye', name: '艾晔', type: '青年男声', scene: '文学', quality: '精品' },
        { id: 'aiting', name: '艾婷', type: '电台女声', scene: '文学', quality: '精品' },
        { id: 'aifan', name: '艾凡', type: '情感女声', scene: '文学', quality: '精品' },
        { id: 'ainan', name: '艾楠', type: '广告男声', scene: '文学', quality: '精品' },
        { id: 'aihao', name: '艾浩', type: '资讯男声', scene: '文学', quality: '精品' },
        { id: 'aiming', name: '艾茗', type: '诙谐男声', scene: '文学', quality: '精品' },
        { id: 'aixiao', name: '艾笑', type: '资讯女声', scene: '文学', quality: '精品' },
        { id: 'aichu', name: '艾厨', type: '舌尖男声', scene: '文学', quality: '精品' },
        { id: 'aiqian', name: '艾倩', type: '资讯女声', scene: '文学', quality: '精品' },
        { id: 'aishu', name: '艾树', type: '资讯男声', scene: '文学', quality: '精品' },
        { id: 'airu', name: '艾茹', type: '新闻女声', scene: '文学', quality: '精品' },
        
        // 超高清场景
        { id: 'zhiqi', name: '知琪', type: '温柔女声', scene: '超高清', quality: '精品' },
        { id: 'zhichu', name: '知厨', type: '舌尖男声', scene: '超高清', quality: '精品' },
        { id: 'zhixiang', name: '知祥', type: '磁性男声', scene: '超高清', quality: '精品' },
        { id: 'zhijia', name: '知佳', type: '标准女声', scene: '超高清', quality: '精品' },
        { id: 'zhinan', name: '知楠', type: '广告男声', scene: '超高清', quality: '精品' },
        { id: 'zhiqian', name: '知倩', type: '资讯女声', scene: '超高清', quality: '精品' },
        { id: 'zhiru', name: '知茹', type: '新闻女声', scene: '超高清', quality: '精品' },
        { id: 'zhide', name: '知德', type: '新闻男声', scene: '超高清', quality: '精品' },
        { id: 'zhifei', name: '知飞', type: '激昂解说', scene: '超高清', quality: '精品' },
        { id: 'zhilun', name: '知伦', type: '悬疑解说', scene: '超高清', quality: '精品' },
        { id: 'zhiwei', name: '知薇', type: '萝莉女声', scene: '超高清', quality: '精品' },
        
        // 多情感音色
        { id: 'zhifeng_emo', name: '知锋（多情感）', type: '多情感男声', scene: '通用', quality: '标准' },
        { id: 'zhibing_emo', name: '知冰（多情感）', type: '多情感男声', scene: '通用', quality: '标准' },
        { id: 'zhimiao_emo', name: '知妙（多情感）', type: '多情感女声', scene: '中英', quality: '标准' },
        { id: 'zhimi_emo', name: '知米（多情感）', type: '多情感女声', scene: '通用', quality: '标准' },
        { id: 'zhiyan_emo', name: '知燕（多情感）', type: '多情感女声', scene: '通用', quality: '标准' },
        { id: 'zhitian_emo', name: '知甜（多情感）', type: '多情感女声', scene: '通用', quality: '标准' },
        
        // 方言音色
        { id: 'shanshan', name: '姗姗', type: '粤语女声', scene: '方言', quality: '标准' },
        { id: 'chuangirl', name: '小玥', type: '四川话女声', scene: '方言', quality: '标准' },
        { id: 'qingqing', name: '青青', type: '中国台湾话女声', scene: '方言', quality: '标准' },
        { id: 'cuijie', name: '翠姐', type: '东北话女声', scene: '方言', quality: '标准' },
        { id: 'xiaoze', name: '小泽', type: '湖南重口音男声', scene: '方言', quality: '标准' },
        { id: 'dahu', name: '大虎', type: '东北话男声', scene: '方言', quality: '标准' },
        { id: 'aikan', name: '艾侃', type: '天津话男声', scene: '方言', quality: '标准' },
        { id: 'zhiqing', name: '知青', type: '中国台湾话女声', scene: '方言', quality: '精品' },
        { id: 'jiajia', name: '佳佳', type: '粤语女声', scene: '方言', quality: '标准' },
        { id: 'taozi', name: '桃子', type: '粤语女声', scene: '方言', quality: '标准' },
        { id: 'kelly', name: 'Kelly', type: '香港粤语女声', scene: '方言', quality: '标准' },
        
        // 英文音色
        { id: 'harry', name: 'Harry', type: '英音男声', scene: '英文', quality: '标准' },
        { id: 'abby', name: 'Abby', type: '美音女声', scene: '英文', quality: '标准' },
        { id: 'andy', name: 'Andy', type: '美音男声', scene: '英文', quality: '标准' },
        { id: 'eric', name: 'Eric', type: '英音男声', scene: '英文', quality: '标准' },
        { id: 'emily', name: 'Emily', type: '英音女声', scene: '英文', quality: '标准' },
        { id: 'luna', name: 'Luna', type: '英音女声', scene: '英文', quality: '标准' },
        { id: 'luca', name: 'Luca', type: '英音男声', scene: '英文', quality: '标准' },
        { id: 'wendy', name: 'Wendy', type: '英音女声', scene: '英文', quality: '标准' },
        { id: 'william', name: 'William', type: '英音男声', scene: '英文', quality: '标准' },
        { id: 'olivia', name: 'Olivia', type: '英音女声', scene: '英文', quality: '标准' },
        { id: 'lydia', name: 'Lydia', type: '英中双语女声', scene: '英文', quality: '标准' },
        { id: 'annie', name: 'Annie', type: '美语女声', scene: '英文', quality: '标准' },
        { id: 'betty', name: 'Betty', type: '美式英文女声', scene: '英文', quality: '标准' },
        { id: 'beth', name: 'Beth', type: '美式英文女声', scene: '英文', quality: '标准' },
        { id: 'cindy', name: 'Cindy', type: '美式英文女声', scene: '英文', quality: '标准' },
        { id: 'donna', name: 'Donna', type: '美式英文女声', scene: '英文', quality: '标准' },
        { id: 'eva', name: 'Eva', type: '美式英文女声', scene: '英文', quality: '标准' },
        { id: 'brian', name: 'Brian', type: '美式英文男声', scene: '英文', quality: '标准' },
        { id: 'david', name: 'David', type: '美式英文男声', scene: '英文', quality: '标准' },
        { id: 'ava', name: 'Ava', type: '美语女声', scene: '英文', quality: '标准' },
        { id: 'becca', name: 'Becca', type: '美语客服女声', scene: '英文', quality: '标准' },
        
        // 其他语言
        { id: 'tomoka', name: '智香', type: '日语女声', scene: '多语种', quality: '标准' },
        { id: 'tomoya', name: '智也', type: '日语男声', scene: '多语种', quality: '标准' },
        { id: 'indah', name: 'Indah', type: '印尼语女声', scene: '多语种', quality: '标准' },
        { id: 'farah', name: 'Farah', type: '马来语女声', scene: '多语种', quality: '标准' },
        { id: 'tala', name: 'Tala', type: '菲律宾语女声', scene: '多语种', quality: '标准' },
        { id: 'tien', name: 'Tien', type: '越南语女声', scene: '多语种', quality: '标准' },
        { id: 'kyong', name: 'Kyong', type: '韩语女声', scene: '多语种', quality: '标准' },
        { id: 'masha', name: 'Masha', type: '俄语女声', scene: '多语种', quality: '标准' },
        { id: 'camila', name: 'Camila', type: '西班牙语女声', scene: '多语种', quality: '标准' },
        { id: 'perla', name: 'Perla', type: '意大利语女声', scene: '多语种', quality: '标准' },
        { id: 'clara', name: 'Clara', type: '法语女声', scene: '多语种', quality: '标准' },
        { id: 'hanna', name: 'Hanna', type: '德语女声', scene: '多语种', quality: '标准' },
        { id: 'waan', name: 'Waan', type: '泰语女声', scene: '多语种', quality: '标准' }
    ];
}

/**
 * 检查配置是否完整
 * @returns {boolean} 配置是否完整
 */
export function checkConfig() {
    const { appKey } = getConfig();
    const accessKeyId = process.env.ALI_TTS_ACCESS_KEY_ID || '';
    const accessKeySecret = process.env.ALI_TTS_ACCESS_KEY_SECRET || '';
    
    if (!appKey || !accessKeyId || !accessKeySecret) {
        console.error('❌ 阿里云 TTS 配置不完整');
        console.error('当前配置:', {
            appKey: appKey ? `${appKey.substring(0, 8)}...` : '未设置',
            accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : '未设置',
            accessKeySecret: accessKeySecret ? '已设置' : '未设置'
        });
        console.error('请在 .env 文件中配置:');
        console.error('  ALI_TTS_APP_KEY=your_app_key');
        console.error('  ALI_TTS_ACCESS_KEY_ID=your_access_key_id');
        console.error('  ALI_TTS_ACCESS_KEY_SECRET=your_access_key_secret');
        return false;
    }
    return true;
}

export default {
    textToSpeech,
    textToSpeechFile,
    batchTextToSpeech,
    getSupportedVoices,
    checkConfig
};
