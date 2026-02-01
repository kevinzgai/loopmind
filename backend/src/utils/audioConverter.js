/**
 * 音频格式转换工具
 */

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
    // 对于简单的 PCM 转换，我们直接返回
    if (format === 'pcm') {
        return audioBuffer;
    }
    
    // 这里应该实现实际的音频转换逻辑
    // 为了简化，暂时直接返回输入（实际应用中需要使用 ffmpeg 或其他库）
    console.warn(`⚠️ 未实现从 ${format} 到 PCM 的转换，直接返回原始数据`);
    return audioBuffer;
}