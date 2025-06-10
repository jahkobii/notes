/**
 * Stream-related TypeScript interfaces for SMPTE 2110 multiview application
 * Following broadcast industry standards for metadata and stream management
 */

export interface Resolution {
  width: number;
  height: number;
}

export interface StreamSource {
  /** Source identifier */
  id: string;
  /** Source name */
  name: string;
  /** Source status */
  status: 'active' | 'inactive' | 'error' | 'buffering';
  /** Source resolution */
  resolution: Resolution;
}

export interface StreamMetadata {
  /** Unique stream identifier following SMPTE naming conventions */
  id: string;
  /** Human-readable stream name for display */
  name: string;
  /** Stream source URL (HLS/DASH/WebRTC endpoint) */
  url: string;
  /** Current stream status */
  status: 'active' | 'inactive' | 'error' | 'buffering';
  /** Video resolution information */
  resolution: Resolution;
  /** Current bitrate in Mbps */
  bitrate: number;
  /** Network latency in milliseconds */
  latency: number;
  /** Frame rate (fps) */
  frameRate: number;
  /** Audio configuration */
  audio: {
    /** Number of audio channels */
    channels: number;
    /** Sample rate in Hz */
    sampleRate: number;
    /** Current audio levels (0-100) for each channel */
    levels: number[];
    /** Mute state */
    muted: boolean;
  };
  /** Timestamp of last update */
  lastUpdate: Date;
  /** Stream visibility state */
  visible: boolean;
  /** Current source ID */
  sourceId: string;
}

export interface GridLayout {
  /** Layout identifier */
  id: string;
  /** Display name */
  name: string;
  /** Grid dimensions */
  rows: number;
  cols: number;
  /** Total tiles available */
  totalTiles: number;
}

export interface MultiviewState {
  /** Currently active layout */
  currentLayout: GridLayout;
  /** Available stream list */
  streams: StreamMetadata[];
  /** Stream assignments to grid positions */
  streamAssignments: Map<number, string>;
  /** Global mute state */
  globalMute: boolean;
  /** Master volume (0-100) */
  masterVolume: number;
}

/**
 * Audio level thresholds for visual indicators
 * Following broadcast standards for audio monitoring
 */
export const AUDIO_THRESHOLDS = {
  SAFE: 60,      // Green zone (0-60%)
  CAUTION: 80,   // Yellow zone (60-80%)
  DANGER: 95,    // Red zone (80-95%)
  PEAK: 100      // Peak indicator (95-100%)
} as const;