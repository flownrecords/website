import { Loader } from "lucide-react";

export default function PageLoader() {
    return (
        <>
            <div className="container mx-auto max-w-6xl p-4 h-screen">
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin w-12 h-12 text-white/25" />
                </div>
            </div>
        </>
    )
}