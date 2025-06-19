export default function Footer() {
    return (
        <>
            <footer className="bg-secondary py-4 mt-12">
                <div className="container mx-auto text-center opacity-75">
                    <p className="text-sm">© {new Date().getFullYear()} Flown Records. All rights reserved.</p>
                    <p className="text-xs mt-2">Made with ❤️ by the Flown Records team.</p>
                </div>
            </footer>
        </>
    )
}