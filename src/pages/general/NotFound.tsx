export default function NotFound() {
    return (
        <>
            <h1 className="text-4xl font-bold text-center mt-10">
                404 - Page Not Found
            </h1>
            <p className="text-center mt-4">
                The page you are looking for does not exist.
            </p>
            <p className="text-center mt-2">
                Please check the URL or return to the <a href="/" className="text-blue-500 hover:underline">home page</a>.
            </p>
        </>
    )
}