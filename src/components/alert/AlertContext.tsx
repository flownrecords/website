// @ts-ignore
import { createContext, useState, ReactNode } from "react";
import CustomAlert from "./CustomAlert";
import type { AlertData } from "./types";

type AlertContextType = (title: string, message: string) => Promise<void>;

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<AlertData>(null);

    const showAlert = (title: string, message: string) =>
        new Promise<void>((resolve) => {
            setAlert({
                title,
                message,
                handleClose: () => {
                    resolve();
                },
            });
        });

    const closeAlert = () => setAlert(null);

    return (
        <AlertContext.Provider value={showAlert}>
            {children}
            <CustomAlert alert={alert} closeAlert={closeAlert} />
        </AlertContext.Provider>
    );
};

export default AlertContext;
