import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';
import { promisify } from 'util';

// 设置 ffmpeg 路径
ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * 将音频转换为 PCM 格式
 * @param {Buffer} inputBuffer - 输入音频数据
 * @param {string} inputFormat - 输入格式（webm, mp3, wav 等）
 * @param {Object} options - 转换选项
 * @returns {Promise<Buffer>} PCM 音频数据
 */
export async function convertToPcm(inputBuffer, inputFormat = 'webm', options = {}) {
    const {
        sampleRate = 16000,
        channels = 1,
        bitDepth = 16
    } = options;

    return new Promise((resolve, reject) => {
        const chunks = [];
        
        // 创建可读流
        const inputStream = new Readable();
        inputStream.push(inputBuffer);
        inputStream.push(null);

        // 使用 ffmpeg 转换 - 优化参数以提高速度
        ffmpeg(inputStream)
            .inputFormat(inputFormat)
            .audioFrequency(sampleRate)
            .audioChannels(channels)
            .audioCodec('pcm_s16le')
            .format('s16le')
            // 优化：添加快速转换参数
            .outputOptions([
                '-threads 0',  // 使用所有可用 CPU 核心
                '-preset ultrafast'  // 使用最快的预设
            ])
            .on('error', (err) => {
                console.error('❌ 音频转换失败:', err);
                reject(new Error(`音频转换失败: ${err.message}`));
            })
            .on('end', () => {
                console.log('✅ 音频转换完成');
                const pcmBuffer = Buffer.concat(chunks);
                resolve(pcmBuffer);
            })
            .pipe()
            .on('data', (chunk) => {
                chunks.push(chunk);
            });
    });
}

/**
 * 将音频转换为 WAV 格式
 * @param {Buffer} inputBuffer - 输入音频数据
 * @param {string} inputFormat - 输入格式
 * @param {Object} options - 转换选项
 * @returns {Promise<Buffer>} WAV 音频数据
 */
export async function convertToWav(inputBuffer, inputFormat = 'webm', options = {}) {
    const {
        sampleRate = 16000,
        channels = 1
    } = options;

    return new Promise((resolve, reject) => {
        const chunks = [];
        
        const inputStream = new Readable();
        inputStream.push(inputBuffer);
        inputStream.push(null);

        ffmpeg(inputStream)
            .inputFormat(inputFormat)
            .audioFrequency(sampleRate)
            .audioChannels(channels)
            .format('wav')
            .on('error', (err) => {
                console.error('❌ 音频转换失败:', err);
                reject(new Error(`音频转换失败: ${err.message}`));
            })
            .on('end', () => {
                console.log('✅ 音频转换完成');
                const wavBuffer = Buffer.concat(chunks);
                resolve(wavBuffer);
            })
            .pipe()
            .on('data', (chunk) => {
                chunks.push(chunk);
            });
    });
}

/**
 * 检测音频格式
 * @param {Buffer} audioBuffer - 音频数据
 * @returns {Promise<Object>} 音频信息
 */
export async function getAudioInfo(audioBuffer) {
    return new Promise((resolve, reject) => {
        const inputStream = new Readable();
        inputStream.push(audioBuffer);
        inputStream.push(null);

        ffmpeg.ffprobe(inputStream, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
}

export default {
    convertToPcm,
    convertToWav,
    getAudioInfo
};
