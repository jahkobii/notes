<template>
  <!--
    StreamTile Component
    Individual stream display tile for the multiview grid
    
    This is the core component for displaying individual video streams within
    the multiview grid. Each tile represents one video source and provides:
    
    - Video display area with status indicators
    - Stream metadata overlay (name, resolution, frame rate)
    - Audio level monitoring with real-time bars
    - Interactive controls (mute, visibility, source selection)
    - Responsive design for different grid layouts
    - Fullscreen mode optimization
    
    The component handles both active streams and placeholder tiles for
    empty grid positions, providing a consistent interface regardless
    of stream availability.
  -->
  <div 
    class="relative bg-broadcast-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
    :class="{
      'ring-2 ring-broadcast-accent': isSelected,
      'opacity-30': !stream.visible || (!stream.status || stream.status === 'inactive'),
      'rounded-none': isFullscreen
    }"
  >
    <!-- Tile Control Buttons Overlay -->
    <!-- 
      Interactive controls that appear on hover
      Positioned in top-left corner with proper z-indexing
      Only visible when hovering over the tile to maintain clean interface
    -->
    <div class="absolute top-2 left-2 z-10 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <!-- Visibility Toggle Button -->
      <!-- 
        Eye icon that toggles stream visibility
        Green when visible, gray when hidden
        Essential for operators to quickly show/hide streams
      -->
      <button
        @click.stop="toggleVisibility"
        class="bg-black/70 backdrop-blur-sm border border-gray-600 rounded p-1.5 text-white hover:bg-black/90 transition-all duration-200 shadow-sm"
        :class="{
          'text-green-400 bg-green-400/20': stream.visible,
          'text-gray-400 bg-gray-700/50': !stream.visible,
          'p-1': isFullscreen,
          'p-1.5': !isFullscreen
        }"
        :title="stream.visible ? 'Hide Stream' : 'Show Stream'"
      >
        <!-- Eye icon with conditional visibility states -->
        <svg 
          class="w-4 h-4" 
          :class="{ 'w-3 h-3': isFullscreen, 'w-4 h-4': !isFullscreen }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <!-- Open eye for visible streams -->
          <path v-if="stream.visible" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path v-if="stream.visible" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          <!-- Crossed eye for hidden streams -->
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
        </svg>
      </button>

      <!-- Source Selection Button and Dropdown -->
      <!-- 
        Allows operators to change the video source for this tile
        Dropdown shows available sources with status indicators
        Critical for live production workflow flexibility
      -->
      <div class="relative">
        <button
          @click.stop="toggleSourceMenu"
          class="bg-black/70 backdrop-blur-sm border border-gray-600 rounded p-1.5 text-white hover:bg-black/90 transition-all duration-200 shadow-sm"
          :class="{
            'p-1': isFullscreen,
            'p-1.5': !isFullscreen,
            'bg-broadcast-accent/30 border-broadcast-accent': showSourceMenu
          }"
          :title="'Change Source'"
        >
          <!-- Up/down arrow icon -->
          <svg 
            class="w-4 h-4" 
            :class="{ 'w-3 h-3': isFullscreen, 'w-4 h-4': !isFullscreen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
          </svg>
        </button>

        <!-- Source Selection Dropdown Menu -->
        <!-- 
          Dropdown list of available video sources
          Shows source name, resolution, and status
          Positioned to avoid clipping at screen edges
        -->
        <div 
          v-if="showSourceMenu"
          class="absolute top-full left-0 mt-1 bg-broadcast-secondary border border-gray-600 rounded-lg shadow-lg z-20 min-w-48"
          :class="{ 'min-w-40 text-xs': isFullscreen, 'min-w-48 text-sm': !isFullscreen }"
        >
          <!-- Dropdown header -->
          <div class="p-2 border-b border-gray-600">
            <span class="text-gray-300 font-medium" :class="{ 'text-xs': isFullscreen, 'text-sm': !isFullscreen }">
              Select Source
            </span>
          </div>
          
          <!-- Scrollable source list -->
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="source in availableSources"
              :key="source.id"
              @click.stop="selectSource(source)"
              class="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors duration-200 flex items-center justify-between"
              :class="{
                'bg-broadcast-accent/20 text-broadcast-accent': stream.sourceId === source.id,
                'text-gray-300': stream.sourceId !== source.id,
                'px-2 py-1.5 text-xs': isFullscreen,
                'px-3 py-2 text-sm': !isFullscreen
              }"
            >
              <!-- Source information -->
              <div class="flex-1 min-w-0">
                <div class="truncate font-medium">{{ source.name }}</div>
                <div class="text-xs text-gray-400 truncate">{{ source.resolution.width }}×{{ source.resolution.height }}</div>
              </div>
              
              <!-- Status indicator dot -->
              <div 
                class="w-2 h-2 rounded-full ml-2 flex-shrink-0"
                :class="{
                  'bg-green-400': source.status === 'active',
                  'bg-yellow-400': source.status === 'buffering',
                  'bg-red-400': source.status === 'error',
                  'bg-gray-400': source.status === 'inactive'
                }"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Resolution Selection Button and Dropdown -->
      <!-- 
        Allows dynamic resolution changes for bandwidth optimization
        Important for adapting to network conditions and display requirements
      -->
      <div class="relative">
        <button
          @click.stop="toggleResolutionMenu"
          class="bg-black/70 backdrop-blur-sm border border-gray-600 rounded p-1.5 text-white hover:bg-black/90 transition-all duration-200 shadow-sm"
          :class="{
            'p-1': isFullscreen,
            'p-1.5': !isFullscreen,
            'bg-broadcast-accent/30 border-broadcast-accent': showResolutionMenu
          }"
          :title="'Change Resolution'"
        >
          <!-- Grid/resolution icon -->
          <svg 
            class="w-4 h-4" 
            :class="{ 'w-3 h-3': isFullscreen, 'w-4 h-4': !isFullscreen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
        </button>

        <!-- Resolution Selection Dropdown Menu -->
        <!-- 
          List of standard broadcast resolutions
          From 4K down to SD for various use cases
        -->
        <div 
          v-if="showResolutionMenu"
          class="absolute top-full left-0 mt-1 bg-broadcast-secondary border border-gray-600 rounded-lg shadow-lg z-20 min-w-36"
          :class="{ 'min-w-32 text-xs': isFullscreen, 'min-w-36 text-sm': !isFullscreen }"
        >
          <!-- Dropdown header -->
          <div class="p-2 border-b border-gray-600">
            <span class="text-gray-300 font-medium" :class="{ 'text-xs': isFullscreen, 'text-sm': !isFullscreen }">
              Resolution
            </span>
          </div>
          
          <!-- Resolution options -->
          <div>
            <button
              v-for="resolution in availableResolutions"
              :key="`${resolution.width}x${resolution.height}`"
              @click.stop="selectResolution(resolution)"
              class="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors duration-200"
              :class="{
                'bg-broadcast-accent/20 text-broadcast-accent': 
                  stream.resolution.width === resolution.width && stream.resolution.height === resolution.height,
                'text-gray-300': 
                  !(stream.resolution.width === resolution.width && stream.resolution.height === resolution.height),
                'px-2 py-1.5 text-xs': isFullscreen,
                'px-3 py-2 text-sm': !isFullscreen
              }"
            >
              {{ resolution.width }}×{{ resolution.height }}
              <span class="text-xs text-gray-400 ml-1">({{ resolution.label }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Display Area -->
    <!-- 
      Main content area showing the video stream
      Maintains 16:9 aspect ratio for broadcast standard
      Includes overlays for various states and information
    -->
    <div class="aspect-video bg-gray-900 relative">
      <!-- Stream Hidden Overlay -->
      <!-- 
        Shown when stream visibility is toggled off
        Provides clear indication that stream is intentionally hidden
      -->
      <div 
        v-if="!stream.visible"
        class="absolute inset-0 bg-black/80 flex items-center justify-center z-5"
      >
        <div class="text-center text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
          </svg>
          <div class="text-sm font-medium">Stream Hidden</div>
        </div>
      </div>

      <!-- Active Stream Display -->
      <!-- 
        Placeholder for actual video content
        In production, this would contain the actual video element
        Currently shows gradient background with stream identification
      -->
      <div 
        v-if="stream.status === 'active' && stream.visible"
        class="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center"
      >
        <!-- Stream name overlay for identification -->
        <div class="text-white/60 text-sm font-mono">
          {{ stream.name }}
        </div>
        
        <!-- Live indicator -->
        <!-- Red pulsing dot indicating active live stream -->
        <div class="absolute top-2 right-2 flex items-center space-x-1">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-xs text-white/80 font-semibold">LIVE</span>
        </div>
        
        <!-- Technical information overlay -->
        <!-- Shows current resolution and frame rate -->
        <div class="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white/80">
          {{ stream.resolution.width }}×{{ stream.resolution.height }}@{{ stream.frameRate }}fps
        </div>
      </div>
      
      <!-- Inactive Stream State -->
      <!-- 
        Shown when stream is not active
        Provides status information and error indication
      -->
      <div 
        v-else-if="stream.visible"
        class="w-full h-full bg-gray-800 flex items-center justify-center"
      >
        <div class="text-center text-gray-400">
          <div class="text-xl mb-2">⚠</div>
          <div class="text-sm">{{ getStatusText(stream.status) }}</div>
        </div>
      </div>
      
      <!-- Click overlay for tile selection -->
      <!-- 
        Transparent overlay that handles tile selection
        Provides hover effect and click handling
      -->
      <div 
        class="absolute inset-0 bg-transparent hover:bg-white/5 cursor-pointer transition-colors duration-200"
        @click="$emit('select', stream.id)"
      ></div>
    </div>
    
    <!-- Stream Information Bar -->
    <!-- 
      Bottom section containing stream metadata and controls
      Includes name, audio levels, mute button, and technical metrics
      Responsive sizing for fullscreen mode
    -->
    <div 
      class="bg-broadcast-primary p-3 space-y-2"
      :class="{ 
        'p-2 space-y-1': isFullscreen,
        'p-3 space-y-2': !isFullscreen 
      }"
    >
      <!-- Stream Name and Mute Control Row -->
      <!-- 
        Top row of information bar
        Stream name on left, mute button on right
      -->
      <div class="flex items-center justify-between">
        <!-- Stream name with truncation for long names -->
        <h3 
          class="font-semibold text-white truncate flex-1"
          :class="{ 
            'text-xs': isFullscreen,
            'text-sm': !isFullscreen 
          }"
        >
          {{ stream.name }}
        </h3>
        
        <!-- Mute/Unmute Button -->
        <!-- 
          Toggle button for stream audio
          Red when muted, gray when active
          Essential for audio management in multiview
        -->
        <button
          @click="toggleMute"
          class="ml-2 p-1.5 rounded hover:bg-white/10 transition-colors duration-200"
          :class="{
            'text-red-400 bg-red-400/20': stream.audio.muted,
            'text-gray-400 hover:text-white': !stream.audio.muted,
            'p-1': isFullscreen,
            'p-1.5': !isFullscreen
          }"
          :title="stream.audio.muted ? 'Unmute' : 'Mute'"
        >
          <!-- Speaker icon with conditional mute state -->
          <svg 
            class="w-4 h-4" 
            :class="{ 'w-3 h-3': isFullscreen, 'w-4 h-4': !isFullscreen }"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <!-- Speaker with sound waves when not muted -->
            <path v-if="!stream.audio.muted" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.791L5.653 14H4a1 1 0 01-1-1V7a1 1 0 011-1h1.653l2.73-2.791a1 1 0 011.617.167zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
            <!-- Speaker with X when muted -->
            <path v-else d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.791L5.653 14H4a1 1 0 01-1-1V7a1 1 0 011-1h1.653l2.73-2.791a1 1 0 011.617.167zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <!-- Audio Level Bars -->
      <!-- 
        Real-time audio level visualization
        Always visible, including in fullscreen mode
        Compact mode reduces size while maintaining functionality
      -->
      <AudioLevelBars 
        :levels="stream.audio.levels"
        :muted="stream.audio.muted"
        :compact="isFullscreen"
      />
      
      <!-- Stream Technical Metrics -->
      <!-- 
        Bottom row showing technical information
        Hidden in fullscreen mode to save space
        Includes bitrate, latency, and last update timestamp
      -->
      <div 
        v-show="!isFullscreen"
        class="flex items-center justify-between text-xs text-gray-400 pt-1"
      >
        <!-- Left side: Technical metrics -->
        <div class="flex items-center space-x-3">
          <span title="Current bitrate in Mbps">{{ stream.bitrate }}Mbps</span>
          <span title="Network latency in milliseconds">{{ stream.latency }}ms</span>
        </div>
        
        <!-- Right side: Last update indicator -->
        <div 
          class="flex items-center space-x-1"
          :title="`Last updated: ${stream.lastUpdate.toLocaleTimeString()}`"
        >
          <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span>{{ formatTimestamp(stream.lastUpdate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { StreamMetadata, StreamSource, Resolution } from '../types/stream';
import AudioLevelBars from './AudioLevelBars.vue';

/**
 * Component props interface
 * Defines all input properties for the StreamTile component
 */
interface Props {
  /** Stream metadata object containing all stream information */
  stream: StreamMetadata;
  
  /** Whether this tile is currently selected (highlighted with accent border) */
  isSelected?: boolean;
  
  /** Whether the tile is in fullscreen mode (affects sizing and visibility of elements) */
  isFullscreen?: boolean;
}

/**
 * Component events interface
 * Defines all events that this component can emit to parent components
 */
interface Emits {
  /** Emitted when tile is clicked/selected */
  select: [streamId: string];
  
  /** Emitted when mute state changes */
  mute: [streamId: string, muted: boolean];
  
  /** Emitted when visibility state changes */
  visibilityChange: [streamId: string, visible: boolean];
  
  /** Emitted when source is changed */
  sourceChange: [streamId: string, sourceId: string];
  
  /** Emitted when resolution is changed */
  resolutionChange: [streamId: string, resolution: Resolution];
}

// Define props with default values
const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isFullscreen: false
});

// Define emits for type safety
const emit = defineEmits<Emits>();

// Component reactive state
const showSourceMenu = ref(false);      // Controls source dropdown visibility
const showResolutionMenu = ref(false);  // Controls resolution dropdown visibility

/**
 * Available video sources for source selection dropdown
 * In production, this would come from an API endpoint
 * Represents various cameras, graphics, and other video inputs
 */
const availableSources = ref<StreamSource[]>([
  { id: 'cam-01', name: 'Camera 1 - Main Stage', status: 'active', resolution: { width: 1920, height: 1080 } },
  { id: 'cam-02', name: 'Camera 2 - Audience', status: 'active', resolution: { width: 1920, height: 1080 } },
  { id: 'cam-03', name: 'Camera 3 - Close-up', status: 'active', resolution: { width: 1280, height: 720 } },
  { id: 'cam-04', name: 'Camera 4 - Wide Shot', status: 'inactive', resolution: { width: 3840, height: 2160 } },
  { id: 'gfx-01', name: 'Graphics - Lower Thirds', status: 'active', resolution: { width: 1920, height: 1080 } },
  { id: 'gfx-02', name: 'Graphics - Overlay', status: 'buffering', resolution: { width: 1920, height: 1080 } },
  { id: 'aud-01', name: 'Audio Board Feed', status: 'active', resolution: { width: 1920, height: 1080 } },
  { id: 'rec-01', name: 'Recording Playback', status: 'error', resolution: { width: 1920, height: 1080 } }
]);

/**
 * Available resolution options for dynamic resolution changes
 * Standard broadcast resolutions from 4K down to SD
 * Includes human-readable labels for each resolution
 */
const availableResolutions = ref<(Resolution & { label: string })[]>([
  { width: 3840, height: 2160, label: '4K UHD' },
  { width: 1920, height: 1080, label: 'Full HD' },
  { width: 1280, height: 720, label: 'HD' },
  { width: 854, height: 480, label: 'SD' }
]);

/**
 * Toggle visibility of this stream
 * Emits visibilityChange event to parent component
 */
function toggleVisibility(): void {
  emit('visibilityChange', props.stream.id, !props.stream.visible);
}

/**
 * Toggle mute state for this stream
 * Emits mute event to parent component
 */
function toggleMute(): void {
  emit('mute', props.stream.id, !props.stream.audio.muted);
}

/**
 * Toggle source selection menu visibility
 * Ensures only one dropdown is open at a time
 */
function toggleSourceMenu(): void {
  showSourceMenu.value = !showSourceMenu.value;
  if (showSourceMenu.value) {
    showResolutionMenu.value = false;
  }
}

/**
 * Toggle resolution selection menu visibility
 * Ensures only one dropdown is open at a time
 */
function toggleResolutionMenu(): void {
  showResolutionMenu.value = !showResolutionMenu.value;
  if (showResolutionMenu.value) {
    showSourceMenu.value = false;
  }
}

/**
 * Select a new source for this stream
 * Emits sourceChange event and closes the dropdown
 * 
 * @param source - The selected source object
 */
function selectSource(source: StreamSource): void {
  emit('sourceChange', props.stream.id, source.id);
  showSourceMenu.value = false;
}

/**
 * Select a new resolution for this stream
 * Emits resolutionChange event and closes the dropdown
 * 
 * @param resolution - The selected resolution object
 */
function selectResolution(resolution: Resolution): void {
  emit('resolutionChange', props.stream.id, resolution);
  showResolutionMenu.value = false;
}

/**
 * Get human-readable status text for stream states
 * Converts technical status codes to user-friendly messages
 * 
 * @param status - Stream status code
 * @returns Human-readable status message
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'inactive': return 'Stream Offline';
    case 'error': return 'Connection Error';
    case 'buffering': return 'Buffering...';
    default: return 'No Signal';
  }
}

/**
 * Format timestamp for display in the UI
 * Shows relative time (seconds/minutes ago) or absolute time for older updates
 * 
 * @param date - Date object to format
 * @returns Formatted time string
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 1000) return 'now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  
  return date.toLocaleTimeString().slice(0, 5);
}

/**
 * Handle clicks outside of dropdown menus to close them
 * Provides better UX by closing dropdowns when user clicks elsewhere
 * 
 * @param event - Mouse click event
 */
function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Element;
  if (!target.closest('.relative')) {
    showSourceMenu.value = false;
    showResolutionMenu.value = false;
  }
}

// Lifecycle hooks for managing event listeners
onMounted(() => {
  // Add global click listener when component mounts
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // Clean up event listener when component unmounts
  document.removeEventListener('click', handleClickOutside);
});
</script>