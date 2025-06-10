/**
 * Multiview Composable
 * Manages multiview state, stream data, and real-time updates
 * 
 * This composable serves as the central state management system for the
 * multiview application. It provides a reactive interface for all
 * multiview-related operations including:
 * 
 * - Stream data management and real-time updates
 * - Grid layout configuration and switching
 * - Audio control (individual and global muting, volume)
 * - Stream visibility and source management
 * - Real-time subscription to stream updates
 * 
 * The composable follows Vue 3 Composition API patterns and provides
 * a clean, reactive interface that can be easily consumed by components
 * throughout the application.
 */

import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import type { StreamMetadata, GridLayout, MultiviewState, Resolution } from '../types/stream';
import { streamService, GRID_LAYOUTS } from '../services/mockStreamService';

/**
 * Multiview management composable
 * 
 * This is the main composable function that encapsulates all multiview
 * functionality. It manages reactive state, provides computed properties
 * for derived data, and exposes methods for state manipulation.
 * 
 * @returns Object containing reactive state and methods for multiview management
 */
export function useMultiview() {
  // ==========================================
  // REACTIVE STATE MANAGEMENT
  // ==========================================
  
  /**
   * Array of all available streams with their metadata
   * Updated in real-time via subscription to stream service
   */
  const streams = ref<StreamMetadata[]>([]);
  
  /**
   * Currently selected grid layout configuration
   * Defaults to 2x2 grid for initial display
   */
  const currentLayout = ref<GridLayout>(GRID_LAYOUTS[0]); // Default to 2x2
  
  /**
   * ID of currently selected stream (for highlighting)
   * Null when no stream is selected
   */
  const selectedStreamId = ref<string | null>(null);
  
  /**
   * Global mute state affecting all streams
   * When true, all streams are muted regardless of individual settings
   */
  const globalMute = ref(false);
  
  /**
   * Master volume level (0-100) affecting all streams
   * Provides proportional volume control across all audio
   */
  const masterVolume = ref(75);
  
  /**
   * Real-time update subscription cleanup function
   * Used to unsubscribe from stream updates when component unmounts
   */
  let unsubscribe: (() => void) | null = null;

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  
  /**
   * Number of currently active streams
   * Computed from streams array, updates automatically when stream status changes
   */
  const activeStreamsCount = computed(() => 
    streams.value.filter(stream => stream.status === 'active').length
  );

  /**
   * Total number of available streams
   * Simple count of all streams in the system
   */
  const totalStreamsCount = computed(() => streams.value.length);

  /**
   * Complete multiview state object
   * Provides a comprehensive view of the current system state
   * Useful for debugging and state persistence
   */
  const multiviewState = computed<MultiviewState>(() => ({
    currentLayout: currentLayout.value,
    streams: streams.value,
    streamAssignments: new Map(), // Could be extended for custom assignments
    globalMute: globalMute.value,
    masterVolume: masterVolume.value
  }));

  // ==========================================
  // INITIALIZATION AND LIFECYCLE
  // ==========================================
  
  /**
   * Initialize multiview system
   * 
   * Sets up initial state and establishes real-time connection
   * to stream service for live updates. Called automatically
   * when the composable is first used.
   */
  function initialize(): void {
    // Load initial stream data from service
    streams.value = streamService.getStreams();
    
    // Subscribe to real-time updates
    // This ensures the UI stays synchronized with actual stream states
    unsubscribe = streamService.subscribe((updatedStreams) => {
      streams.value = updatedStreams;
    });
  }

  // ==========================================
  // LAYOUT MANAGEMENT
  // ==========================================
  
  /**
   * Change grid layout configuration
   * 
   * Updates the current layout and handles any necessary cleanup
   * such as clearing selections that don't fit in the new layout.
   * 
   * @param layout - New grid layout configuration to apply
   */
  function changeLayout(layout: GridLayout): void {
    currentLayout.value = layout;
    
    // Clear selection if it doesn't fit in new layout
    // This prevents confusion when switching to smaller grids
    if (selectedStreamId.value) {
      const selectedIndex = streams.value.findIndex(s => s.id === selectedStreamId.value);
      if (selectedIndex >= layout.totalTiles) {
        selectedStreamId.value = null;
      }
    }
  }

  // ==========================================
  // STREAM SELECTION AND INTERACTION
  // ==========================================
  
  /**
   * Select or deselect a stream
   * 
   * Toggles selection state for the specified stream.
   * Selected streams are highlighted in the UI for operator reference.
   * 
   * @param streamId - ID of stream to select/deselect
   */
  function selectStream(streamId: string): void {
    selectedStreamId.value = selectedStreamId.value === streamId ? null : streamId;
  }

  // ==========================================
  // AUDIO CONTROL METHODS
  // ==========================================
  
  /**
   * Toggle mute state for individual stream
   * 
   * Delegates to stream service to maintain consistency
   * between UI state and actual stream configuration.
   * 
   * @param streamId - ID of stream to mute/unmute
   */
  function toggleStreamMute(streamId: string): void {
    streamService.toggleStreamMute(streamId);
  }

  /**
   * Toggle global mute state
   * 
   * When enabled, mutes all streams regardless of individual settings.
   * When disabled, restores individual stream mute states.
   * Essential for emergency audio control in broadcast environments.
   */
  function toggleGlobalMute(): void {
    globalMute.value = !globalMute.value;
    
    // Apply global mute state to all streams
    // This ensures consistent audio behavior across the system
    streams.value.forEach(stream => {
      if (stream.audio.muted !== globalMute.value) {
        streamService.toggleStreamMute(stream.id);
      }
    });
  }

  /**
   * Change master volume level
   * 
   * Updates the master volume with bounds checking to ensure
   * valid range (0-100). Affects all streams proportionally.
   * 
   * @param volume - New volume level (0-100)
   */
  function changeMasterVolume(volume: number): void {
    masterVolume.value = Math.max(0, Math.min(100, volume));
  }

  // ==========================================
  // STREAM CONFIGURATION METHODS
  // ==========================================
  
  /**
   * Toggle stream visibility
   * 
   * Shows or hides individual streams without affecting their
   * underlying state. Hidden streams remain in the grid but
   * display a placeholder instead of video content.
   * 
   * @param streamId - ID of stream to show/hide
   */
  function toggleStreamVisibility(streamId: string): void {
    streamService.toggleStreamVisibility(streamId);
  }

  /**
   * Change stream source
   * 
   * Switches the video source for a specific stream tile.
   * Allows operators to dynamically reassign video inputs
   * during live production without disrupting other streams.
   * 
   * @param streamId - ID of stream to change source for
   * @param sourceId - ID of new video source
   */
  function changeStreamSource(streamId: string, sourceId: string): void {
    streamService.changeStreamSource(streamId, sourceId);
  }

  /**
   * Change stream resolution
   * 
   * Updates the resolution for a specific stream, typically
   * for bandwidth optimization or display quality adjustment.
   * May trigger bitrate adjustments automatically.
   * 
   * @param streamId - ID of stream to change resolution for
   * @param resolution - New resolution configuration
   */
  function changeStreamResolution(streamId: string, resolution: Resolution): void {
    streamService.changeStreamResolution(streamId, resolution);
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  /**
   * Get stream metadata by ID
   * 
   * Utility method for retrieving specific stream information.
   * Returns undefined if stream is not found.
   * 
   * @param streamId - ID of stream to retrieve
   * @returns Stream metadata object or undefined
   */
  function getStream(streamId: string): StreamMetadata | undefined {
    return streams.value.find(stream => stream.id === streamId);
  }

  /**
   * Assign stream to specific grid position
   * 
   * Advanced feature for custom stream positioning within the grid.
   * Currently delegates to stream service for future implementation
   * of drag-and-drop or manual positioning features.
   * 
   * @param streamId - ID of stream to position
   * @param position - Grid position index (0-based)
   */
  function assignStreamToPosition(streamId: string, position: number): void {
    streamService.assignStreamToPosition(streamId, position);
  }

  // ==========================================
  // LIFECYCLE MANAGEMENT
  // ==========================================
  
  // Initialize when composable is first used
  onMounted(() => {
    initialize();
  });

  // Cleanup when composable is no longer needed
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // ==========================================
  // PUBLIC API
  // ==========================================
  
  /**
   * Return reactive interface for components
   * 
   * This object defines the public API of the composable,
   * exposing only the necessary state and methods to consuming components.
   * The structure promotes clean separation of concerns and makes
   * the composable easy to use and test.
   */
  return {
    // ===== REACTIVE STATE =====
    streams,                    // Current stream data
    currentLayout,              // Active grid layout
    selectedStreamId,           // Currently selected stream
    globalMute,                 // Global mute state
    masterVolume,               // Master volume level
    
    // ===== COMPUTED PROPERTIES =====
    activeStreamsCount,         // Number of active streams
    totalStreamsCount,          // Total stream count
    multiviewState,             // Complete system state
    
    // ===== CONFIGURATION =====
    availableLayouts: GRID_LAYOUTS,  // Available grid layouts
    
    // ===== ACTION METHODS =====
    changeLayout,               // Change grid layout
    selectStream,               // Select/deselect streams
    toggleStreamMute,           // Toggle individual stream mute
    toggleStreamVisibility,     // Show/hide individual streams
    changeStreamSource,         // Change stream video source
    changeStreamResolution,     // Change stream resolution
    toggleGlobalMute,           // Toggle global mute
    changeMasterVolume,         // Change master volume
    getStream,                  // Get stream by ID
    assignStreamToPosition      // Assign stream to grid position
  };
}