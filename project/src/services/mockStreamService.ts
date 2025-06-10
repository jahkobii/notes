/**
 * Mock Stream Service for SMPTE 2110 Multiview Application
 * Simulates real-time stream data and orchestration API responses
 * In production, this would interface with actual SMPTE 2110 relay services
 */

import type { StreamMetadata, GridLayout, MultiviewState, Resolution } from '../types/stream';

/**
 * Mock stream data generator
 * Simulates various broadcast scenarios including different resolutions and audio configs
 */
function generateMockStream(id: string, name: string): StreamMetadata {
  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 3840, height: 2160 }
  ];
  
  const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];
  const frameRates = [25, 29.97, 30, 50, 59.94, 60];
  
  return {
    id,
    name,
    url: `https://example.com/stream/${id}`, // Would be actual HLS/WebRTC endpoint
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    resolution,
    bitrate: Math.round((Math.random() * 50 + 10) * 10) / 10, // 1-60 Mbps
    latency: Math.round(Math.random() * 100 + 20), // 20-120ms
    frameRate: frameRates[Math.floor(Math.random() * frameRates.length)],
    audio: {
      channels: Math.random() > 0.5 ? 2 : 8, // Stereo or multichannel
      sampleRate: 48000, // Standard broadcast sample rate
      levels: Array.from({ length: 4 }, () => Math.random() * 100),
      muted: false
    },
    lastUpdate: new Date(),
    visible: true,
    sourceId: id // Default source ID matches stream ID
  };
}

/**
 * Available grid layouts following broadcast multiview standards
 */
export const GRID_LAYOUTS: GridLayout[] = [
  { id: '2x2', name: '2×2 Grid', rows: 2, cols: 2, totalTiles: 4 },
  { id: '3x3', name: '3×3 Grid', rows: 3, cols: 3, totalTiles: 9 },
  { id: '4x4', name: '4×4 Grid', rows: 4, cols: 4, totalTiles: 16 }
];

/**
 * Mock stream service class
 * Provides simulated real-time data for development and testing
 */
export class MockStreamService {
  private streams: StreamMetadata[] = [];
  private updateInterval: number | null = null;
  private listeners: ((streams: StreamMetadata[]) => void)[] = [];

  constructor() {
    this.initializeMockStreams();
    this.startRealTimeUpdates();
  }

  /**
   * Initialize mock streams with realistic broadcast scenarios
   */
  private initializeMockStreams(): void {
    const streamConfigs = [
      { id: 'cam-01', name: 'Camera 1 - Main Stage' },
      { id: 'cam-02', name: 'Camera 2 - Audience' },
      { id: 'cam-03', name: 'Camera 3 - Close-up' },
      { id: 'cam-04', name: 'Camera 4 - Wide Shot' },
      { id: 'gfx-01', name: 'Graphics - Lower Thirds' },
      { id: 'gfx-02', name: 'Graphics - Overlay' },
      { id: 'aud-01', name: 'Audio Board Feed' },
      { id: 'rec-01', name: 'Recording Playback' },
      { id: 'ext-01', name: 'External Feed 1' },
      { id: 'ext-02', name: 'External Feed 2' },
      { id: 'mon-01', name: 'Monitoring - Program' },
      { id: 'mon-02', name: 'Monitoring - Preview' },
      { id: 'iso-01', name: 'ISO Recording 1' },
      { id: 'iso-02', name: 'ISO Recording 2' },
      { id: 'rem-01', name: 'Remote Feed - Studio B' },
      { id: 'rem-02', name: 'Remote Feed - OB Unit' }
    ];

    this.streams = streamConfigs.map(config => 
      generateMockStream(config.id, config.name)
    );
  }

  /**
   * Start real-time audio level and metadata updates
   * Simulates live stream monitoring data
   */
  private startRealTimeUpdates(): void {
    this.updateInterval = window.setInterval(() => {
      this.streams.forEach(stream => {
        // Update audio levels with realistic patterns
        stream.audio.levels = stream.audio.levels.map((level, index) => {
          const variation = (Math.random() - 0.5) * 20;
          const newLevel = Math.max(0, Math.min(100, level + variation));
          
          // Simulate occasional peaks and silence
          if (Math.random() > 0.95) return Math.random() > 0.5 ? 95 : 5;
          
          return newLevel;
        });

        // Occasionally update bitrate and latency to simulate network conditions
        if (Math.random() > 0.9) {
          stream.bitrate = Math.round((stream.bitrate + (Math.random() - 0.5) * 5) * 10) / 10;
          stream.latency = Math.max(10, stream.latency + Math.floor((Math.random() - 0.5) * 20));
        }

        stream.lastUpdate = new Date();
      });

      // Notify all listeners of updates
      this.listeners.forEach(listener => listener(this.streams));
    }, 100); // 10fps update rate for smooth audio level animation
  }

  /**
   * Get all available streams
   */
  getStreams(): StreamMetadata[] {
    return [...this.streams];
  }

  /**
   * Get stream by ID
   */
  getStream(id: string): StreamMetadata | undefined {
    return this.streams.find(stream => stream.id === id);
  }

  /**
   * Subscribe to real-time stream updates
   */
  subscribe(listener: (streams: StreamMetadata[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Toggle stream mute state
   */
  toggleStreamMute(streamId: string): void {
    const stream = this.streams.find(s => s.id === streamId);
    if (stream) {
      stream.audio.muted = !stream.audio.muted;
    }
  }

  /**
   * Toggle stream visibility
   */
  toggleStreamVisibility(streamId: string): void {
    const stream = this.streams.find(s => s.id === streamId);
    if (stream) {
      stream.visible = !stream.visible;
    }
  }

  /**
   * Change stream source
   */
  changeStreamSource(streamId: string, sourceId: string): void {
    const stream = this.streams.find(s => s.id === streamId);
    if (stream) {
      stream.sourceId = sourceId;
      // In a real implementation, this would trigger a source change
      // For now, we'll just update the name to reflect the new source
      const sourceNames: Record<string, string> = {
        'cam-01': 'Camera 1 - Main Stage',
        'cam-02': 'Camera 2 - Audience',
        'cam-03': 'Camera 3 - Close-up',
        'cam-04': 'Camera 4 - Wide Shot',
        'gfx-01': 'Graphics - Lower Thirds',
        'gfx-02': 'Graphics - Overlay',
        'aud-01': 'Audio Board Feed',
        'rec-01': 'Recording Playback'
      };
      
      if (sourceNames[sourceId]) {
        stream.name = sourceNames[sourceId];
      }
    }
  }

  /**
   * Change stream resolution
   */
  changeStreamResolution(streamId: string, resolution: Resolution): void {
    const stream = this.streams.find(s => s.id === streamId);
    if (stream) {
      stream.resolution = { ...resolution };
      // Simulate bitrate adjustment based on resolution
      const pixelCount = resolution.width * resolution.height;
      if (pixelCount >= 3840 * 2160) { // 4K
        stream.bitrate = Math.round((Math.random() * 30 + 40) * 10) / 10; // 40-70 Mbps
      } else if (pixelCount >= 1920 * 1080) { // 1080p
        stream.bitrate = Math.round((Math.random() * 20 + 15) * 10) / 10; // 15-35 Mbps
      } else { // 720p or lower
        stream.bitrate = Math.round((Math.random() * 10 + 5) * 10) / 10; // 5-15 Mbps
      }
    }
  }

  /**
   * Update stream assignment to grid position
   * In production, this would sync with orchestration layer
   */
  assignStreamToPosition(streamId: string, position: number): void {
    // Mock implementation - would interface with orchestration API
    console.log(`Assigning stream ${streamId} to position ${position}`);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.listeners = [];
  }
}

// Singleton instance for application use
export const streamService = new MockStreamService();