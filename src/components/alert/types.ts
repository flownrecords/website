export type AlertData = {
    title: string;
    message: string;
    handleClose?: () => void;
} | null;
