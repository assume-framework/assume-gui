import { Alert, Snackbar } from '@mui/material';

import type { AlertState } from '../types';

interface AlertSnackbarProps {
  alert: AlertState;
  onClose: () => void;
}

/** App-wide snackbar; open while the alert has a message. */
export default function AlertSnackbar({ alert, onClose }: AlertSnackbarProps) {
  return (
    <Snackbar
      open={!!alert.message}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={onClose}
      onClick={onClose}
    >
      <Alert severity={alert.severity} variant="outlined">
        {alert.message}
      </Alert>
    </Snackbar>
  );
}
