import type { AlertColor } from '@mui/material';

/** Message shown in the app-wide snackbar. */
export interface AlertState {
  message: string;
  severity: AlertColor;
}
