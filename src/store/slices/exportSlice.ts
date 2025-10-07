import { createSlice } from '@reduxjs/toolkit';

interface ExportState {
  exportSvgTrigger: number;
  exportPngWhiteBgTrigger: number;
  exportPngTransparentTrigger: number;
  exportPdfTrigger: number;
}

const initialState: ExportState = {
  exportSvgTrigger: 0,
  exportPngWhiteBgTrigger: 0,
  exportPngTransparentTrigger: 0,
  exportPdfTrigger: 0,
};

const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    triggerExportSvg: (state) => {
      state.exportSvgTrigger += 1;
    },
    triggerExportPngWhiteBg: (state) => {
      state.exportPngWhiteBgTrigger += 1;
    },
    triggerExportPngTransparent: (state) => {
      state.exportPngTransparentTrigger += 1;
    },
    triggerExportPdf: (state) => {
      state.exportPdfTrigger += 1;
    },
  },
});

export const { triggerExportSvg, triggerExportPngWhiteBg, triggerExportPngTransparent, triggerExportPdf } =
  exportSlice.actions;

export default exportSlice.reducer;
