<template>
  <!--
    MultiviewGrid Component
    Main grid container for displaying multiple stream tiles
    
    This component serves as the primary display area for the multiview application.
    It manages the layout and arrangement of individual stream tiles in a responsive
    grid format. Key responsibilities include:
    
    - Dynamic grid layout based on selected configuration (2x2, 3x3, 4x4)
    - Stream tile management and positioning
    - Fullscreen mode optimization
    - Empty state handling when no streams are available
    - Layout switching controls for fullscreen mode
    - Event delegation from child components to parent
    
    The component adapts its appearance and functionality based on the current
    viewing mode (normal vs fullscreen) and provides seamless transitions
    between different grid layouts.
  -->
  <div class="space-y-6 h-full" :class="{ 'space-y-0': isFullscreen }">
    <!-- Grid Header Section -->
    <!-- 
      Top section containing title, layout badge, and status indicators
      Hidden in fullscreen mode to maximize viewing area
      Provides context and system status information
    -->
    <div 
      v-show="!isFullscreen"
      class="flex items-center justify-between transition-all duration-300"
    >
      <!-- Left side: Title and layout information -->
      <div class="flex items-center space-x-4">
        <!-- Main title with icon -->
        <h1 class="text-2xl font-bold text-white flex items-center">
          <svg class="w-8 h-8 mr-3 text-broadcast-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
          </svg>
          Multiview Monitor
        </h1>
        
        <!-- Current Layout Badge -->
        <!-- Shows the currently active grid layout -->
        <div class="bg-broadcast-accent/20 border border-broadcast-accent/50 rounded-full px-3 py-1">
          <span class="text-sm font-medium text-broadcast-accent">{{ currentLayout.name }}</span>
        </div>
      </div>
      
      <!-- Right side: Status indicators and timestamp -->
      <div class="flex items-center space-x-4">
        <!-- System status indicator -->
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-sm text-gray-300">System Online</span>
        </div>
        
        <!-- Current time display -->
        <div class="text-sm text-gray-400">
          {{ new Date().toLocaleTimeString() }}
        </div>
      </div>
    </div>
    
    <!-- Main Grid Container -->
    <!-- 
      Primary content area containing the stream tiles
      Uses CSS Grid for responsive layout management
      Dynamically adjusts based on current layout configuration
    -->
    <div 
      class="grid gap-4 transition-all duration-500 ease-in-out"
      :style="gridStyle"
      :class="{ 
        'gap-2 h-full': isFullscreen,
        'gap-4': !isFullscreen 
      }"
    >
      <!-- Stream Tiles -->
      <!-- 
        Individual stream display components
        Each tile represents one video source or empty slot
        Handles both active streams and placeholder tiles
      -->
      <StreamTile
        v-for="(stream, index) in displayedStreams"
        :key="`${stream?.id || `empty-${index}`}`"
        :stream="stream || createEmptyStream(index)"
        :isSelected="selectedStreamId === stream?.id"
        :isFullscreen="isFullscreen"
        @select="handleStreamSelect"
        @mute="handleStreamMute"
        @visibilityChange="handleVisibilityChange"
        @sourceChange="handleSourceChange"
        @resolutionChange="handleResolutionChange"
        class="animate-fade-in"
      />
    </div>
    
    <!-- Empty State Display -->
    <!-- 
      Shown when no streams are available and not in fullscreen mode
      Provides user guidance and visual feedback
    -->
    <div 
      v-if="displayedStreams.length === 0 && !isFullscreen"
      class="text-center py-12 text-gray-400"
    >
      <!-- Empty state icon -->
      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
      </svg>
      
      <!-- Empty state messaging -->
      <h3 class="text-lg font-medium mb-2">No Streams Available</h3>
      <p class="text-sm">Connect streams to begin monitoring</p>
    </div>

    <!-- Fullscreen Layout Controls Overlay -->
    <!-- 
      Floating control panel for layout switching in fullscreen mode
      Positioned at bottom center with backdrop blur for visibility
      Only visible when in fullscreen mode
    -->
    <div 
      v-if="isFullscreen"
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-broadcast-secondary/90 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 flex items-center space-x-4 shadow-lg transition-all duration-300"
    >
      <!-- Layout selection label -->
      <span class="text-sm text-gray-300">Layout:</span>
      
      <!-- Layout selection buttons -->
      <div class="flex space-x-2">
        <button
          v-for="layout in availableLayouts"
          :key="layout.id"
          @click="$emit('layoutChange', layout)"
          class="px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
          :class="{
            'bg-broadcast-accent text-white': currentLayout.id === layout.id,
            'bg-gray-700 text-gray-300 hover:bg-gray-600': currentLayout.id !== layout.id
          }"
        >
          {{ layout.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StreamMetadata, GridLayout, Resolution } from '../types/stream';
import StreamTile from './StreamTile.vue';

/**
 * Component props interface
 * Defines all configurable properties for the MultiviewGrid component
 */
interface Props {
  /** Array of available streams to display */
  streams: StreamMetadata[];
  
  /** Current grid layout configuration (2x2, 3x3, 4x4) */
  currentLayout: GridLayout;
  
  /** ID of currently selected stream (for highlighting) */
  selectedStreamId?: string;
  
  /** Whether the grid is in fullscreen mode */
  isFullscreen?: boolean;
  
  /** Available layouts for fullscreen controls */
  availableLayouts?: GridLayout[];
}

/**
 * Component events interface
 * Defines all events that this component can emit to parent components
 */
interface Emits {
  /** Emitted when a stream tile is selected */
  streamSelect: [streamId: string];
  
  /** Emitted when a stream's mute state changes */
  streamMute: [streamId: string, muted: boolean];
  
  /** Emitted when layout changes in fullscreen mode */
  layoutChange: [layout: GridLayout];
  
  /** Emitted when stream visibility changes */
  visibilityChange: [streamId: string, visible: boolean];
  
  /** Emitted when stream source changes */
  sourceChange: [streamId: string, sourceId: string];
  
  /** Emitted when stream resolution changes */
  resolutionChange: [streamId: string, resolution: Resolution];
}

// Define props with default values
const props = withDefaults(defineProps<Props>(), {
  isFullscreen: false,
  availableLayouts: () => []
});

// Define emits for type safety
const emit = defineEmits<Emits>();

/**
 * Compute CSS grid style based on current layout and fullscreen state
 * 
 * This computed property generates the appropriate CSS Grid configuration
 * based on the selected layout (2x2, 3x3, 4x4) and adjusts sizing for
 * fullscreen mode. The grid automatically adapts to different screen sizes
 * while maintaining proper aspect ratios.
 */
const gridStyle = computed(() => {
  // Base grid configuration from layout settings
  const baseStyle = {
    gridTemplateColumns: `repeat(${props.currentLayout.cols}, 1fr)`,
    gridTemplateRows: `repeat(${props.currentLayout.rows}, 1fr)`,
  };

  // Fullscreen mode adjustments
  if (props.isFullscreen) {
    return {
      ...baseStyle,
      height: '100vh',      // Full viewport height
      padding: '0.5rem'     // Minimal padding for edge spacing
    };
  }

  // Normal mode with minimum height based on layout
  return {
    ...baseStyle,
    minHeight: `${Math.max(400, (props.currentLayout.rows * 200))}px`
  };
});

/**
 * Get streams to display in grid, filling empty slots as needed
 * 
 * This computed property ensures that the grid always has the correct
 * number of tiles based on the current layout. It fills available
 * stream slots first, then creates empty placeholder tiles for
 * remaining positions.
 */
const displayedStreams = computed(() => {
  const totalTiles = props.currentLayout.totalTiles;
  const result: (StreamMetadata | null)[] = [];
  
  // Fill grid positions with available streams or null placeholders
  for (let i = 0; i < totalTiles; i++) {
    result[i] = props.streams[i] || null;
  }
  
  return result;
});

/**
 * Handle stream selection from child components
 * Delegates the event to the parent component
 * 
 * @param streamId - ID of the selected stream
 */
function handleStreamSelect(streamId: string): void {
  emit('streamSelect', streamId);
}

/**
 * Handle stream mute toggle from child components
 * Delegates the event to the parent component
 * 
 * @param streamId - ID of the stream to mute/unmute
 * @param muted - New mute state
 */
function handleStreamMute(streamId: string, muted: boolean): void {
  emit('streamMute', streamId, muted);
}

/**
 * Handle stream visibility change from child components
 * Delegates the event to the parent component
 * 
 * @param streamId - ID of the stream to show/hide
 * @param visible - New visibility state
 */
function handleVisibilityChange(streamId: string, visible: boolean): void {
  emit('visibilityChange', streamId, visible);
}

/**
 * Handle stream source change from child components
 * Delegates the event to the parent component
 * 
 * @param streamId - ID of the stream to change source for
 * @param sourceId - ID of the new source
 */
function handleSourceChange(streamId: string, sourceId: string): void {
  emit('sourceChange', streamId, sourceId);
}

/**
 * Handle stream resolution change from child components
 * Delegates the event to the parent component
 * 
 * @param streamId - ID of the stream to change resolution for
 * @param resolution - New resolution configuration
 */
function handleResolutionChange(streamId: string, resolution: Resolution): void {
  emit('resolutionChange', streamId, resolution);
}

/**
 * Create placeholder stream for empty grid positions
 * 
 * This function generates a placeholder stream object for empty
 * grid positions, ensuring consistent tile display even when
 * fewer streams are available than grid positions.
 * 
 * @param index - Grid position index
 * @returns Placeholder stream metadata object
 */
function createEmptyStream(index: number): StreamMetadata {
  return {
    id: `empty-${index}`,
    name: `Tile ${index + 1}`,
    url: '',
    status: 'inactive',
    resolution: { width: 1920, height: 1080 },
    bitrate: 0,
    latency: 0,
    frameRate: 0,
    audio: {
      channels: 2,
      sampleRate: 48000,
      levels: [0, 0, 0, 0],
      muted: true
    },
    lastUpdate: new Date(),
    visible: true,
    sourceId: ''
  };
}
</script>