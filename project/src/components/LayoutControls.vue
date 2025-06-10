<template>
  <!--
    LayoutControls Component
    Grid layout selection and multiview configuration controls
    
    This component provides the primary control interface for managing
    the multiview display configuration. It serves as the command center
    for operators to:
    
    - Switch between different grid layouts (2x2, 3x3, 4x4)
    - Control global audio settings (master mute, volume)
    - Monitor system status and stream statistics
    - Access layout-specific information and metrics
    
    The component is designed for professional broadcast environments
    where quick access to layout controls is essential for live
    production workflows.
  -->
  <div class="bg-broadcast-secondary rounded-lg p-4 shadow-lg">
    <!-- Header Section -->
    <!-- 
      Top section with component title and stream count indicator
      Provides immediate feedback on system status
    -->
    <div class="flex items-center justify-between mb-4">
      <!-- Component title with icon -->
      <h2 class="text-lg font-semibold text-white flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
        </svg>
        Layout Controls
      </h2>
      
      <!-- Stream Count Indicator -->
      <!-- Shows active vs total streams for quick status check -->
      <div class="text-sm text-gray-400">
        {{ activeStreamsCount }} / {{ totalStreamsCount }} streams active
      </div>
    </div>
    
    <!-- Grid Layout Selection Section -->
    <!-- 
      Primary control area for selecting grid configurations
      Visual grid representations help users understand layout options
    -->
    <div class="space-y-3">
      <!-- Section label -->
      <label class="text-sm font-medium text-gray-300 block">Grid Layout</label>
      
      <!-- Layout option buttons in 3-column grid -->
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="layout in availableLayouts"
          :key="layout.id"
          @click="$emit('layoutChange', layout)"
          class="flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105"
          :class="{
            'border-broadcast-accent bg-broadcast-accent/20 text-white': currentLayout.id === layout.id,
            'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500': currentLayout.id !== layout.id
          }"
        >
          <!-- Visual Grid Representation -->
          <!-- 
            Mini grid showing the actual layout structure
            Provides immediate visual feedback of grid configuration
          -->
          <div 
            class="grid gap-0.5 mb-2"
            :style="{ 
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`
            }"
          >
            <!-- Individual grid squares -->
            <div
              v-for="i in layout.totalTiles"
              :key="i"
              class="w-2 h-2 rounded-sm"
              :class="{
                'bg-broadcast-accent': currentLayout.id === layout.id,
                'bg-gray-500': currentLayout.id !== layout.id
              }"
            ></div>
          </div>
          
          <!-- Layout information -->
          <span class="text-xs font-medium">{{ layout.name }}</span>
          <span class="text-xs text-gray-400">{{ layout.totalTiles }} tiles</span>
        </button>
      </div>
    </div>
    
    <!-- Global Audio Controls Section -->
    <!-- 
      Master audio controls affecting all streams
      Critical for broadcast audio management
    -->
    <div class="mt-6 space-y-3">
      <!-- Section label -->
      <label class="text-sm font-medium text-gray-300 block">Global Controls</label>
      
      <!-- Control row with mute and volume -->
      <div class="flex items-center justify-between">
        <!-- Master Mute Toggle Button -->
        <!-- 
          Emergency mute control for all streams
          Red when active to indicate muted state
        -->
        <button
          @click="$emit('toggleGlobalMute')"
          class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
          :class="{
            'bg-red-500 hover:bg-red-600 text-white': globalMute,
            'bg-gray-700 hover:bg-gray-600 text-gray-300': !globalMute
          }"
        >
          <!-- Speaker icon with conditional mute state -->
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <!-- Speaker with sound waves when not muted -->
            <path v-if="!globalMute" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.791L5.653 14H4a1 1 0 01-1-1V7a1 1 0 011-1h1.653l2.73-2.791a1 1 0 011.617.167zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
            <!-- Speaker with X when muted -->
            <path v-else d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.791L5.653 14H4a1 1 0 01-1-1V7a1 1 0 011-1h1.653l2.73-2.791a1 1 0 011.617.167z"/>
          </svg>
          
          <!-- Button label -->
          <span class="text-sm font-medium">{{ globalMute ? 'Unmute All' : 'Mute All' }}</span>
        </button>
        
        <!-- Master Volume Control -->
        <!-- 
          Slider control for overall audio level
          Affects all streams proportionally
        -->
        <div class="flex items-center space-x-2">
          <!-- Volume label -->
          <span class="text-sm text-gray-400">Vol:</span>
          
          <!-- Volume slider -->
          <input
            type="range"
            min="0"
            max="100"
            :value="masterVolume"
            @input="$emit('volumeChange', Number(($event.target as HTMLInputElement).value))"
            class="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <!-- Volume percentage display -->
          <span class="text-sm text-gray-400 min-w-[2rem]">{{ masterVolume }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Layout Statistics Section -->
    <!-- 
      Information panel showing current layout metrics
      Provides quick overview of system status
    -->
    <div class="mt-4 pt-4 border-t border-gray-700">
      <!-- Statistics grid with 3 columns -->
      <div class="grid grid-cols-3 gap-4 text-center">
        <!-- Total tiles in current layout -->
        <div>
          <div class="text-lg font-semibold text-broadcast-accent">{{ currentLayout.totalTiles }}</div>
          <div class="text-xs text-gray-400">Total Tiles</div>
        </div>
        
        <!-- Active streams count -->
        <div>
          <div class="text-lg font-semibold text-green-400">{{ activeStreamsCount }}</div>
          <div class="text-xs text-gray-400">Active</div>
        </div>
        
        <!-- Inactive streams count -->
        <div>
          <div class="text-lg font-semibold text-yellow-400">{{ totalStreamsCount - activeStreamsCount }}</div>
          <div class="text-xs text-gray-400">Inactive</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GridLayout } from '../types/stream';

/**
 * Component props interface
 * Defines all input properties required for the LayoutControls component
 */
interface Props {
  /** Array of available grid layout configurations */
  availableLayouts: GridLayout[];
  
  /** Currently selected/active layout */
  currentLayout: GridLayout;
  
  /** Global mute state affecting all streams */
  globalMute: boolean;
  
  /** Master volume level (0-100) affecting all streams */
  masterVolume: number;
  
  /** Number of currently active streams */
  activeStreamsCount: number;
  
  /** Total number of available streams */
  totalStreamsCount: number;
}

/**
 * Component events interface
 * Defines all events that this component can emit to parent components
 */
interface Emits {
  /** Emitted when user selects a different layout */
  layoutChange: [layout: GridLayout];
  
  /** Emitted when global mute button is toggled */
  toggleGlobalMute: [];
  
  /** Emitted when master volume slider changes */
  volumeChange: [volume: number];
}

// Define props and emits for type safety
defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
/**
 * Custom slider styling for master volume control
 * Provides consistent appearance across different browsers
 * Matches the overall dark theme of the application
 */

/* WebKit browsers (Chrome, Safari, Edge) */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  background: #3b82f6;  /* Blue accent color */
  border-radius: 50%;
  cursor: pointer;
}

/* Firefox */
.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  background: #3b82f6;  /* Blue accent color */
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>