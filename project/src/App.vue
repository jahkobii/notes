<template>
  <!--
    Main Application Component
    Professional Multiview Broadcast Monitor
    
    This is the root component of the multiview application, serving as the
    primary container and coordinator for all child components. It provides:
    
    - Application-wide layout and structure
    - Header with branding and system status
    - Main content area with control panel and multiview grid
    - Footer with technical information and timestamps
    - Fullscreen mode management
    - Global state coordination between components
    
    The component follows broadcast industry standards for professional
    monitoring applications, with emphasis on reliability, clarity, and
    operational efficiency.
  -->
  <div class="min-h-screen bg-broadcast-primary" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- Application Header -->
    <!-- 
      Top navigation bar with branding and system status
      Hidden in fullscreen mode to maximize viewing area
      Provides essential system information and branding
    -->
    <header 
      v-show="!isFullscreen"
      class="bg-broadcast-secondary border-b border-gray-700 px-6 py-4 transition-all duration-300"
    >
      <div class="flex items-center justify-between">
        <!-- Brand Section -->
        <!-- Company/product branding with icon and descriptive text -->
        <div class="flex items-center space-x-3">
          <!-- Brand icon/logo -->
          <div class="w-10 h-10 bg-broadcast-accent rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
            </svg>
          </div>
          
          <!-- Brand text and description -->
          <div>
            <h1 class="text-xl font-bold text-white">SMPTE 2110 Multiview</h1>
            <p class="text-sm text-gray-400">Professional Broadcast Monitor</p>
          </div>
        </div>
        
        <!-- System Status Section -->
        <!-- Real-time system status and connection information -->
        <div class="flex items-center space-x-6">
          <!-- Status text and stream count -->
          <div class="text-right">
            <div class="text-sm font-medium text-green-400">System Online</div>
            <div class="text-xs text-gray-400">{{ streams.length }} streams connected</div>
          </div>
          
          <!-- Status indicator (pulsing green dot) -->
          <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <!-- 
      Primary application content with responsive layout
      Contains control panel (left) and multiview grid (right)
      Adapts layout for fullscreen mode
    -->
    <main class="flex flex-col lg:flex-row gap-6 p-6 transition-all duration-300" :class="{ 'p-0 gap-0': isFullscreen }">
      <!-- Control Panel Sidebar -->
      <!-- 
        Left sidebar containing layout controls and stream management
        Hidden in fullscreen mode to maximize grid viewing area
        Provides all necessary operational controls
      -->
      <aside 
        v-show="!isFullscreen"
        class="w-full lg:w-80 flex-shrink-0 transition-all duration-300"
      >
        <!-- Layout Controls Component -->
        <!-- Primary control interface for grid layout and audio management -->
        <LayoutControls
          :availableLayouts="availableLayouts"
          :currentLayout="currentLayout"
          :globalMute="globalMute"
          :masterVolume="masterVolume"
          :activeStreamsCount="activeStreamsCount"
          :totalStreamsCount="totalStreamsCount"
          @layoutChange="changeLayout"
          @toggleGlobalMute="toggleGlobalMute"
          @volumeChange="changeMasterVolume"
        />
        
        <!-- Stream List Panel -->
        <!-- 
          Detailed list of all available streams with individual controls
          Provides stream-specific management and status information
        -->
        <div class="mt-6 bg-broadcast-secondary rounded-lg p-4">
          <!-- Panel header -->
          <h3 class="text-lg font-semibold text-white mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            Available Streams
          </h3>
          
          <!-- Scrollable stream list -->
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="stream in streams"
              :key="stream.id"
              class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors duration-200 cursor-pointer"
              @click="selectStream(stream.id)"
              :class="{
                'bg-broadcast-accent/20 border border-broadcast-accent/50': selectedStreamId === stream.id,
                'opacity-50': !stream.visible
              }"
            >
              <!-- Stream information -->
              <div class="flex-1 min-w-0">
                <!-- Stream name with visibility indicator -->
                <div class="text-sm font-medium text-white truncate flex items-center">
                  {{ stream.name }}
                  <!-- Hidden stream indicator -->
                  <svg v-if="!stream.visible" class="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                </div>
                
                <!-- Stream resolution -->
                <div class="text-xs text-gray-400">{{ stream.resolution.width }}×{{ stream.resolution.height }}</div>
              </div>
              
              <!-- Stream controls -->
              <div class="flex items-center space-x-2">
                <!-- Status indicator dot -->
                <div 
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-400': stream.status === 'active',
                    'bg-yellow-400': stream.status === 'buffering',
                    'bg-red-400': stream.status === 'error',
                    'bg-gray-400': stream.status === 'inactive'
                  }"
                ></div>
                
                <!-- Individual stream mute button -->
                <button
                  @click.stop="toggleStreamMute(stream.id)"
                  class="p-1 rounded hover:bg-white/10 transition-colors duration-200"
                  :class="{
                    'text-red-400': stream.audio.muted,
                    'text-gray-400': !stream.audio.muted
                  }"
                >
                  <!-- Speaker icon with mute state -->
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="!stream.audio.muted" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.791L5.653 14H4a1 1 0 01-1-1V7a1 1 0 011-1h1.653l2.73-2.791a1 1 0 011.617.167z"/>
                    <path v-else d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.791L5.653 14H4a1 1 0 01-1-1V7a1 1 0 011-1h1.653l2.73-2.791a1 1 0 011.617.167zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Multiview Grid Section -->
      <!-- 
        Main viewing area containing the stream grid
        Expands to full screen in fullscreen mode
        Contains the primary multiview display
      -->
      <section class="flex-1 min-w-0 relative transition-all duration-300" :class="{ 'h-screen': isFullscreen }">
        <!-- Fullscreen Toggle Button -->
        <!-- 
          Floating button for entering/exiting fullscreen mode
          Always visible and accessible for quick mode switching
          Positioned in top-right corner with proper z-indexing
        -->
        <button
          @click="toggleFullscreen"
          class="absolute top-4 right-4 z-10 bg-broadcast-secondary/90 backdrop-blur-sm border border-gray-600 rounded-lg p-2 text-white hover:bg-broadcast-secondary transition-all duration-200 shadow-lg"
          :class="{ 'top-6 right-6': isFullscreen }"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
        >
          <!-- Expand icon for entering fullscreen -->
          <svg v-if="!isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
          
          <!-- Compress icon for exiting fullscreen -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9v-4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5M15 15h4.5m0 0l5.5 5.5"/>
          </svg>
        </button>

        <!-- Multiview Grid Component -->
        <!-- 
          Core component displaying the stream grid
          Handles all stream tile management and layout
          Responds to layout changes and user interactions
        -->
        <MultiviewGrid
          :streams="streams"
          :currentLayout="currentLayout"
          :selectedStreamId="selectedStreamId"
          :isFullscreen="isFullscreen"
          :availableLayouts="availableLayouts"
          @streamSelect="selectStream"
          @streamMute="handleStreamMute"
          @layoutChange="changeLayout"
          @visibilityChange="handleVisibilityChange"
          @sourceChange="handleSourceChange"
          @resolutionChange="handleResolutionChange"
        />
      </section>
    </main>

    <!-- Application Footer -->
    <!-- 
      Bottom bar with technical information and compliance indicators
      Hidden in fullscreen mode to maximize viewing area
      Provides professional context and system information
    -->
    <footer 
      v-show="!isFullscreen"
      class="bg-broadcast-secondary border-t border-gray-700 px-6 py-3 transition-all duration-300"
    >
      <div class="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 gap-2">
        <!-- Left side: Technical compliance and features -->
        <div class="flex items-center space-x-4">
          <span>SMPTE ST 2110 Compliant</span>
          <span class="hidden sm:inline">•</span>
          <span>Professional Broadcast Grade</span>
          <span class="hidden sm:inline">•</span>
          <span>Real-time Monitoring</span>
        </div>
        
        <!-- Right side: Last update timestamp -->
        <div class="flex items-center space-x-2">
          <span>Last Update:</span>
          <span class="text-green-400">{{ new Date().toLocaleTimeString() }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MultiviewGrid from './components/MultiviewGrid.vue';
import LayoutControls from './components/LayoutControls.vue';
import { useMultiview } from './composables/useMultiview';
import type { Resolution } from './types/stream';

/**
 * Initialize multiview system using composable
 * 
 * The useMultiview composable provides all reactive state and methods
 * needed for managing the multiview application. This includes stream
 * data, layout management, audio controls, and real-time updates.
 */
const {
  streams,                    // Reactive array of stream metadata
  currentLayout,              // Currently selected grid layout
  selectedStreamId,           // ID of currently selected stream
  globalMute,                 // Global mute state for all streams
  masterVolume,               // Master volume level (0-100)
  activeStreamsCount,         // Number of active streams
  totalStreamsCount,          // Total number of available streams
  availableLayouts,           // Array of available grid layouts
  changeLayout,               // Function to change grid layout
  selectStream,               // Function to select/deselect streams
  toggleStreamMute,           // Function to toggle individual stream mute
  toggleGlobalMute,           // Function to toggle global mute
  changeMasterVolume,         // Function to change master volume
  toggleStreamVisibility,     // Function to show/hide streams
  changeStreamSource,         // Function to change stream source
  changeStreamResolution      // Function to change stream resolution
} = useMultiview();

/**
 * Fullscreen mode state
 * Controls whether the application is in fullscreen viewing mode
 * When true, hides all UI elements except the multiview grid
 */
const isFullscreen = ref(false);

/**
 * Toggle fullscreen mode
 * 
 * Switches between normal and fullscreen viewing modes.
 * In fullscreen mode:
 * - Header and footer are hidden
 * - Control panel is hidden
 * - Grid expands to full viewport
 * - Minimal controls remain accessible
 * 
 * Also attempts to use browser fullscreen API when available
 */
function toggleFullscreen(): void {
  isFullscreen.value = !isFullscreen.value;
  
  // Attempt to use browser fullscreen API
  if (isFullscreen.value && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {
      // Fallback to just hiding UI elements if fullscreen API fails
      // This ensures functionality even when fullscreen API is not supported
    });
  } else if (!isFullscreen.value && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {
      // Ignore errors when exiting fullscreen
      // User may have already exited via browser controls
    });
  }
}

/**
 * Handle stream mute from grid component
 * 
 * Delegates mute toggle requests from the grid component
 * to the appropriate composable method. This maintains
 * consistent state management across the application.
 * 
 * @param streamId - ID of stream to mute/unmute
 * @param muted - New mute state (currently unused, toggle is used instead)
 */
function handleStreamMute(streamId: string, muted: boolean): void {
  toggleStreamMute(streamId);
}

/**
 * Handle stream visibility change
 * 
 * Processes visibility toggle requests from child components.
 * Allows individual streams to be shown or hidden without
 * affecting other streams or the overall layout.
 * 
 * @param streamId - ID of stream to show/hide
 * @param visible - New visibility state (currently unused, toggle is used instead)
 */
function handleVisibilityChange(streamId: string, visible: boolean): void {
  toggleStreamVisibility(streamId);
}

/**
 * Handle stream source change
 * 
 * Processes source change requests from stream tiles.
 * Allows operators to dynamically switch video sources
 * for individual tiles during live production.
 * 
 * @param streamId - ID of stream to change source for
 * @param sourceId - ID of new video source
 */
function handleSourceChange(streamId: string, sourceId: string): void {
  changeStreamSource(streamId, sourceId);
}

/**
 * Handle stream resolution change
 * 
 * Processes resolution change requests from stream tiles.
 * Enables dynamic quality adjustment for bandwidth
 * optimization and display requirements.
 * 
 * @param streamId - ID of stream to change resolution for
 * @param resolution - New resolution configuration
 */
function handleResolutionChange(streamId: string, resolution: Resolution): void {
  changeStreamResolution(streamId, resolution);
}

/**
 * Keyboard event handler for ESC key
 * Provides quick exit from fullscreen mode using keyboard
 */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false;
  }
});

/**
 * Browser fullscreen change event handler
 * Synchronizes internal fullscreen state with browser fullscreen state
 * Ensures UI remains consistent when user exits fullscreen via browser controls
 */
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    isFullscreen.value = false;
  }
});
</script>

<style scoped>
/**
 * Fullscreen mode styling
 * 
 * When in fullscreen mode, the application container becomes
 * a fixed overlay covering the entire viewport. This ensures
 * maximum viewing area for the multiview grid while maintaining
 * proper layering and background color.
 */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  background: #0f172a;  /* Match broadcast-primary color */
}

/**
 * Smooth transitions for fullscreen mode
 * 
 * Provides smooth animations when entering/exiting fullscreen mode.
 * Uses cubic-bezier easing for professional, polished transitions
 * that enhance the user experience without being distracting.
 */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>