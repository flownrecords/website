import Button from "./Button";

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    buttons
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    buttons?: React.ReactNode[];
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-5000 flex items-center justify-center mx-4">
            <div className="bg-secondary p-4 rounded-lg min-w-96 lg:min-w-128 ring-2 ring-neutral-600">
                <h1 className="text-xl font-semibold mb-2">{title}</h1>
                {children}
                <div className={`mt-4 space-x-2 ${buttons ? "flex flex-row" : "flex justify-end"}`}>
                    <Button onClick={onClose} text="Close" styleType="small"/>
                    {buttons}
                </div>
            </div>
        </div>
    );
}
