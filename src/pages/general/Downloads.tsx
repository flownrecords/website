import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import { useEffect } from "react";
import Footer from "../../components/general/Footer";

type File = {
    name: string;
    link: string;
    id: string;
};

export default function Downloads() {
    const API = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const platforms: File[] = [
        {
            id: "windows",
            name: "Windows",
            link: "https://github.com/flownrecords/desktop/releases/download/v1.0.5/FlownRecordsSetup.exe",
        },
    ];

    const files: File[] = [
        {
            id: "QRH172R",
            name: "Cessna 172R - QRH",
            link: `${API}/download/QRH_C172R.pdf`,
        },
        {
            id: "QRH172S",
            name: "Cessna 172S - QRH",
            link: `${API}/download/QRH_C172S.pdf`,
        },
    ];

    function downloadFile(file: File) {
        window.open(file.link, "_blank");
    }

    const { fileId } = useParams();
    useEffect(() => {
        if (!fileId) return;

        const file = files.find((file) => file.id === fileId);
        if (file) downloadFile(file);

        navigate("/downloads", { replace: true });
    }, []);

    return (
        <>
            <Splash uppertext="Downloads" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="ring-2 ring-white/25 rounded-lg p-4">
                    <h1 className="text-xl font-semibold text-white mb-2">App</h1>
                    <div className="space-y-4">
                        {platforms.map((platform) => (
                            <div
                                className="flex justify-between items-center bg-secondary rounded-lg p-4 ring-2 ring-white/25"
                                key={platform.id}
                            >
                                <h1 className="text-white text-lg font-medium">{platform.name}</h1>
                                <Button
                                    text="Download"
                                    styleType="small"
                                    onClick={() => navigate(platform.link)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ring-2 ring-white/25 rounded-lg p-4 mt-4">
                    <h1 className="text-xl font-semibold text-white mb-2">Files</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {files.map((file) => (
                            <div
                                className="bg-secondary rounded-lg p-4 ring-2 ring-white/25"
                                id={file.id}
                                key={file.id}
                            >
                                <h1 className="font-medium">{file.name}</h1>

                                <Button
                                    className="w-full mt-4"
                                    text="Download"
                                    styleType="small"
                                    onClick={() => downloadFile(file)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
