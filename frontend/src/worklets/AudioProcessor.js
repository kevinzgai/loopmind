// AudioWorklet processor for audio streaming
class AudioStreamingProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.websocketReady = true;  // Set to true by default since we handle WebSocket in main thread
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    if (event.data.type === 'setWebSocket') {
      // We can't directly store WebSocket in AudioWorkletGlobalScope
      // So we'll send audio data through the port to main thread
      this.websocketReady = true;
    }
  }

  process(inputs, outputs, parameters) {
    // Get the input audio data (first input, first channel)
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0]; // First channel
      
      // Convert to 16-bit PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Send the audio data to main thread via port
      if (this.websocketReady) {
        this.port.postMessage({
          type: 'audioData',
          data: pcmData.buffer
        }, [pcmData.buffer]);
      }
    }
    
    // Output is same as input (pass-through)
    const output = outputs[0];
    if (output.length > 0) {
      for (let channel = 0; channel < output.length; channel++) {
        if (input[channel]) {
          output[channel].set(input[channel]);
        }
      }
    }
    
    // Continue processing
    return true;
  }
}

registerProcessor('audio-streaming-processor', AudioStreamingProcessor);