/**
 * 音频格式转换工具
 */

import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { tmpdir } from 'os';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// 设置 ffmpeg 路径
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * 将 PCM 数据转换为 WAV 格式
 * @param {Buffer} pcmBuffer - PCM 音频数据
 * @param {number} sampleRate - 采样率，默认 16000
 * @param {number} channels - 声道数，默认 1
 * @param {number} bitDepth - 位深度，默认 16
 * @returns {Buffer} WAV 格式的音频数据
 */
export function pcmToWav(pcmBuffer, sampleRate = 16000, channels = 1, bitDepth = 16) {
    const wavBuffer = Buffer.alloc(44 + pcmBuffer.length); // WAV header is 44 bytes

    // RIFF identifier
    wavBuffer.write('RIFF', 0);
    
    // File length (total file size - 8 bytes)
    const totalFileSize = 36 + pcmBuffer.length;
    wavBuffer.writeUInt32LE(totalFileSize, 4);
    
    // RIFF type & Format
    wavBuffer.write('WAVE', 8);
    wavBuffer.write('fmt ', 12);
    
    // Format chunk length
    wavBuffer.writeUInt32LE(16, 16); // 16 for PCM
    
    // Audio format (1 = PCM)
    wavBuffer.writeUInt16LE(1, 20);
    
    // Number of channels
    wavBuffer.writeUInt16LE(channels, 22);
    
    // Sample rate
    wavBuffer.writeUInt32LE(sampleRate, 24);
    
    // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
    const byteRate = sampleRate * channels * (bitDepth / 8);
    wavBuffer.writeUInt32LE(byteRate, 28);
    
    // Block align (NumChannels * BitsPerSample/8)
    const blockAlign = channels * (bitDepth / 8);
    wavBuffer.writeUInt16LE(blockAlign, 32);
    
    // Bits per sample
    wavBuffer.writeUInt16LE(bitDepth, 34);
    
    // Data chunk identifier
    wavBuffer.write('data', 36);
    
    // Data chunk length
    wavBuffer.writeUInt32LE(pcmBuffer.length, 40);
    
    // Copy PCM data
    pcmBuffer.copy(wavBuffer, 44);
    
    return wavBuffer;
}

/**
 * 检查音频数据是否有效
 * @param {Buffer} buffer - 音频数据
 * @returns {boolean} 是否有效
 */
export function isValidAudioData(buffer) {
    if (!buffer || buffer.length === 0) {
        return false;
    }
    
    // 检查是否有足够的数据进行语音识别
    // 至少需要 1000 字节的数据（约 0.1 秒 16kHz 16bit 单声道）
    return buffer.length >= 1000;
}

/**
 * 将音频数据转换为 PCM 格式
 * @param {Buffer} audioBuffer - 输入音频数据
 * @param {string} format - 音频格式 ('wav', 'mp3', 'webm', 'ogg', 'pcm')
 * @param {Object} options - 转换选项
 * @returns {Promise<Buffer>} PCM 音频数据
 */
export async function convertToPcm(audioBuffer, format, options = {}) {
    const { sampleRate = 16000, channels = 1, bitDepth = 16 } = options;
    
    // 对于简单的 PCM 转换，我们直接返回
    if (format === 'pcm') {
        return audioBuffer;
    }
    
    // WAV 格式需要提取 PCM 数据
    if (format === 'wav') {
        // WAV 文件的 PCM 数据从第 44 字节开始
        // 但需要验证是否是标准 WAV 格式
        if (audioBuffer.length > 44) {
            const riff = audioBuffer.slice(0, 4).toString('ascii');
            if (riff === 'RIFF') {
                // 找到 data 块
                let offset = 12;
                while (offset < audioBuffer.length - 8) {
                    const chunkId = audioBuffer.slice(offset, offset + 4).toString('ascii');
                    const chunkSize = audioBuffer.readUInt32LE(offset + 4);
                    
                    if (chunkId === 'data') {
                        return audioBuffer.slice(offset + 8, offset + 8 + chunkSize);
                    }
                    offset += 8 + chunkSize;
                }
            }
        }
        // 如果无法解析，直接跳过头部
        return audioBuffer.slice(44);
    }
    
    // 使用 ffmpeg 转换其他格式
    return new Promise((resolve, reject) => {
        const tempDir = tmpdir();
        const inputPath = join(tempDir, `audio-input-${uuidv4()}.${format}`);
        const outputPath = join(tempDir, `audio-output-${uuidv4()}.pcm`);
        
        try {
            // 写入临时输入文件
            writeFileSync(inputPath, audioBuffer);
            
            ffmpeg(inputPath)
                .audioFrequency(sampleRate)
                .audioChannels(channels)
                .audioCodec('pcm_s16le')
                .format('s16le')
                .on('error', (err) => {
                    console.error('❌ FFmpeg 转换错误:', err.message);
                    // 清理临时文件
                    try { unlinkSync(inputPath); } catch (e) {}
                    try { unlinkSync(outputPath); } catch (e) {}
                    reject(new Error(`音频转换失败: ${err.message}`));
                })
                .on('end', () => {
                    try {
                        const pcmBuffer = readFileSync(outputPath);
                        // 清理临时文件
                        try { unlinkSync(inputPath); } catch (e) {}
                        try { unlinkSync(outputPath); } catch (e) {}
                        console.log(`✅ FFmpeg 转换成功: ${format} -> PCM, 大小: ${pcmBuffer.length} bytes`);
                        resolve(pcmBuffer);
                    } catch (err) {
                        reject(new Error(`读取转换结果失败: ${err.message}`));
                    }
                })
                .save(outputPath);
        } catch (err) {
            console.error('❌ 音频转换失败:', err);
            reject(new Error(`音频转换失败: ${err.message}`));
        }
    });
}