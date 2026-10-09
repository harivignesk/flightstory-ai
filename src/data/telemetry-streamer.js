// Real-Time Avionics Telemetry Streamer & SSE Simulator
import datasetJson from './honeywell_fms_dataset.json';

class TelemetryStreamer {
  constructor() {
    this.allRecords = datasetJson.records || [];
    this.currentIndex = 0;
    this.isStreaming = false;
    this.speedMultiplier = 1;
    this.intervalId = null;
    this.listeners = new Set();
    this.streamedBuffer = [];
    this.stats = {
      totalStreamed: 0,
      ratePerSec: 0,
      lastEventTime: null,
      activeNodes: { NODE_A: true, NODE_B: true, NODE_C: true }
    };
  }

  // Subscribe to live telemetry stream events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Emit event to all subscribers
  emit(event) {
    this.listeners.forEach(cb => cb(event));
  }

  // Start real-time streaming
  start(speed = 1) {
    if (this.isStreaming) this.stop();
    this.speedMultiplier = speed;
    this.isStreaming = true;

    const baseDelay = 120 / this.speedMultiplier;
    this.intervalId = setInterval(() => {
      if (this.currentIndex >= this.allRecords.length) {
        this.currentIndex = 0; // Loop live stream
      }

      const record = this.allRecords[this.currentIndex];
      this.currentIndex++;
      this.streamedBuffer.push(record);
      if (this.streamedBuffer.length > 500) this.streamedBuffer.shift();

      this.stats.totalStreamed++;
      this.stats.ratePerSec = Math.round(1000 / baseDelay);
      this.stats.lastEventTime = record.timestamp_display || record.timestamp;

      this.emit({
        type: 'TELEMETRY_PACKET',
        record,
        stats: { ...this.stats },
        buffer: [...this.streamedBuffer]
      });
    }, baseDelay);

    this.emit({ type: 'STREAM_STARTED', speed: this.speedMultiplier });
  }

  // Pause real-time streaming
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStreaming = false;
    this.emit({ type: 'STREAM_PAUSED' });
  }

  // Fast forward stream to specific incident (Fault 6025)
  seekToFault() {
    const faultIndex = this.allRecords.findIndex(r => r.fault_code === 6025);
    if (faultIndex !== -1) {
      this.currentIndex = faultIndex;
      this.emit({ type: 'STREAM_SEEKED', targetIndex: faultIndex });
    }
  }

  // Reset stream back to 0
  reset() {
    this.stop();
    this.currentIndex = 0;
    this.streamedBuffer = [];
    this.stats.totalStreamed = 0;
    this.emit({ type: 'STREAM_RESET' });
  }
}

export const telemetryStreamer = new TelemetryStreamer();
export default telemetryStreamer;
