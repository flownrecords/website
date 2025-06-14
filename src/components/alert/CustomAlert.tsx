import React from "react";
import type { AlertData } from "./types";


type Props = {
  alert: AlertData;
  closeAlert: () => void;
};

const CustomAlert: React.FC<Props> = ({ alert, closeAlert }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-secondary ring-2 ring-neutral-600 rounded-lg p-4 w-[90%] max-w-md text-center">
        <h2 className="text-xl font-semibold mb-3">{alert.title}</h2>
        <p className="mb-4">{alert.message}</p>
        <button
          className="
          inline-block
          cursor-pointer bg-gradient-to-t 
          from-neutral-900 to-neutral-800 
          hover:opacity-75 transition duration-150
          text-white
          py-2 px-6 
          rounded-md text-center
          ring-2 ring-white/25 
          "
          onClick={() => {
            alert.handleClose?.();
            closeAlert();
          }}
        >
          OK
        </button>
        
      </div>
    </div>
  );
};

export default CustomAlert;
