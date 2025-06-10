<template>
  <!-- 
    AudioLevelBars Component
    Real-time audio level visualization for broadcast streams
    Displays 4 vertical bars with color-coded levels and peak indicators
    
    Features:
    - Real-time audio level monitoring with smooth animations
    - Color-coded levels following broadcast standards (green/yellow/red)
    - Peak indicators for audio levels exceeding danger threshold
    - Compact mode for fullscreen multiview display
    - Support for various channel configurations (mono, stereo, multichannel)
    - Mute state visualization with overlay indicator
  -->
  <div 
    class="flex items-end space-x-0.5 px-1 py-1"
    :class="{ 
      'h-6': compact,
      'h-10': !compact 
    }"
  >
    <!-- Individual Audio Level Bars -->
    <!-- Each bar represents one audio channel with real-time level display -->
    <div 
      v-for="(level, index) in audioLevels" 
      :key="index"
      class="relative flex-1 bg-gray-800 rounded-sm overflow-hidden min-w-[3px]"
      :title="`Channel ${index + 1}: ${Math.round(level)}%`"
    >
      <!-- Background bar container -->
      <!-- Provides visual reference for maximum level -->
      <div 
        class="w-full bg-gray-700 rounded-sm"
        :class="{ 
          'h-6': compact,
          'h-10': !compact 
        }"
      ></div>
      
      <!-- Active level indicator -->
      <!-- Height dynamically adjusts based on current audio level -->
      <!-- Color changes based on broadcast-standard thresholds -->
      <div 
        class="absolute bottom-0 left-0 w-full transition-all duration-75 ease-out rounded-sm"
        :class="getBarColorClass(level)"
        :style="{ height: `${Math.max(2, level)}%` }"
      ></div>
      
      <!-- Peak indicator -->
      <!-- Flashing red indicator when audio exceeds danger threshold -->
      <!-- Critical for preventing audio clipping in broadcast -->
      <div 
        v-if="level > AUDIO_THRESHOLDS.DANGER"
        class="absolute top-0 left-0 w-full h-0.5 bg-audio-peak animate-audio-pulse"
      ></div>
      
      <!-- Channel label -->
      <!-- Only shown in non-compact mode to save space -->
      <!-- Provides channel identification for multichannel audio -->
      <div 
        v-if="!compact"
        class="absolute -bottom-4 left-0 w-full text-center"
      >
        <span class="text-xs text-gray-400 font-mono">{{ index + 1 }}</span>
      </div>
    </div>
    
    <!-- Mute indicator overlay -->
    <!-- Covers entire component when stream is muted -->
    <!-- Provides clear visual feedback of mute state -->
    <div 
      v-if="muted"
      class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded"
    >
      <div 
        class="text-red-400 font-bold"
        :class="{ 
          'text-xs': compact,
          'text-sm': !compact 
        }"
      >
        MUTE
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AUDIO_THRESHOLDS } from '../types/stream';

/**
 * Component props interface
 * Defines all configurable properties for the audio level bars
 */
interface Props {
  /** Audio levels for each channel (0-100) */
  /** Array should contain level values for each audio channel */
  levels: number[];
  
  /** Mute state - when true, levels are zeroed and mute overlay shown */
  muted?: boolean;
  
  /** Number of channels to display - defaults to 4 for broadcast standard */
  /** Supports mono (1), stereo (2), or multichannel (4+) configurations */
  channels?: number;
  
  /** Compact mode for fullscreen display - reduces size and removes labels */
  /** Essential for maintaining visibility without overwhelming the interface */
  compact?: boolean;
}

// Set default values for optional props
const props = withDefaults(defineProps<Props>(), {
  muted: false,
  channels: 4,
  compact: false
});

/**
 * Normalize audio levels to 4 channels for consistent display
 * Handles various input configurations (mono, stereo, multichannel)
 * 
 * This computed property ensures we always display exactly 4 bars
 * regardless of the actual number of input channels, which provides
 * consistent UI layout across different stream configurations
 */
const audioLevels = computed(() => {
  const targetChannels = 4;
  const levels = [...props.levels];
  
  // Pad array with zeros if we have fewer than 4 channels
  // This handles mono and stereo inputs gracefully
  while (levels.length < targetChannels) {
    levels.push(0);
  }
  
  // Truncate to exactly 4 channels and apply mute/bounds checking
  return levels.slice(0, targetChannels).map(level => 
    // If muted, return 0; otherwise clamp level between 0-100
    props.muted ? 0 : Math.max(0, Math.min(100, level))
  );
});

/**
 * Get appropriate color class based on audio level
 * Follows broadcast standards for audio monitoring
 * 
 * Color coding follows industry standards:
 * - Green (0-60%): Safe operating level
 * - Yellow (60-80%): Caution zone - approaching limits
 * - Red (80-95%): Danger zone - risk of distortion
 * - Peak Red (95-100%): Critical level - immediate attention required
 * 
 * @param level - Audio level percentage (0-100)
 * @returns CSS class name for appropriate color
 */
function getBarColorClass(level: number): string {
  if (level >= AUDIO_THRESHOLDS.PEAK) {
    return 'bg-audio-peak';
  } else if (level >= AUDIO_THRESHOLDS.DANGER) {
    return 'bg-audio-danger';
  } else if (level >= AUDIO_THRESHOLDS.CAUTION) {
    return 'bg-audio-caution';
  } else {
    return 'bg-audio-safe';
  }
}
</script>