import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiagramMode } from '../../types/ui.types';

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
  isDirty: boolean;
  currentFilename: string | null;
}

export const initialState: UiState = {
  notification: {
    message: '',
    type: 'info',
    visible: false,
  },
  theme: 'light',
  isSidebarVisible: false,
  isPresentationMode: false,
  diagramMode: DiagramMode.Diagram,
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
  setDirty,
  markClean,
  setCurrentFilename,
} = uiSlice.actions;
export default uiSlice.reducer;
