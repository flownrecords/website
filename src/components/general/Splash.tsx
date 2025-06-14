export default function Splash({title = 'Flown Records', uppertext='Welcome to', poweredBy=false }) {
    return (
        <div className="text-center mt-24 mb-12">
            <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white/25">
                    { uppertext }
                </h3>
                <h1 className="text-7xl md:text-8xl font-bold">
                    { title }
                </h1>
                { poweredBy && 
                    <h3 className="font-semibold text-white/50">
                        Powered by 
                    </h3>
                }
            </div>
        </div>
    )
}