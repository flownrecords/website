export default function Footer() {
    return (
        <>
            <footer className="bg-secondary py-4 mt-24">
                <div className="container mx-auto text-center opacity-75">
                    <p className="text-sm">© {new Date().getFullYear()} Flown Records. All rights reserved.</p>
                </div>
            </footer>
        </>
    )
}