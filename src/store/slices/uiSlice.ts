import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiagramMode, InteractionMode } from '../../types/ui.types';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

interface UiState {
  notification: NotificationState;
  theme: 'light' | 'dark';
  isSidebarVisible: boolean;
  isPresentationMode: boolean;
  diagramMode: DiagramMode;
  interactionMode: InteractionMode;
  isDirty: boolean;
  currentFilename: string | null;
}

const initialState: UiState = {
  notification: {
    message: '',
    type: 'info',
    visible: false,
  },
  theme: 'light',
  isSidebarVisible: false, // Start with sidebar closed for better canvas visibility
  isPresentationMode: false,
  diagramMode: DiagramMode.Diagram,
  interactionMode: InteractionMode.Drag,
  isDirty: false,
  currentFilename: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification(
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>
    ) {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type,
        visible: true,
      };
    },
    hideNotification(state) {
      state.notification.visible = false;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar(state) {
      state.isSidebarVisible = !state.isSidebarVisible;
    },
    togglePresentationMode(state) {
      state.isPresentationMode = !state.isPresentationMode;
    },
    setPresentationMode(state, action: PayloadAction<boolean>) {
      state.isPresentationMode = action.payload;
    },
    setDiagramMode(state, action: PayloadAction<DiagramMode>) {
      state.diagramMode = action.payload;
    },
    setInteractionMode(state, action: PayloadAction<InteractionMode>) {
      state.interactionMode = action.payload;
    },
    setDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    markClean(state) {
      state.isDirty = false;
    },
    setCurrentFilename(state, action: PayloadAction<string | null>) {
      state.currentFilename = action.payload;
    },
  },
});

export const {
  showNotification,
  hideNotification,
  toggleTheme,
  toggleSidebar,
  togglePresentationMode,
  setPresentationMode,
  setDiagramMode,
  setInteractionMode,
  setDirty,
  markClean,
  setCurrentFilename,
} = uiSlice.actions;
export default uiSlice.reducer;
