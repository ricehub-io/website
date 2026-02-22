export default function NotFoundPage() {
    return (
        <div className="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col">
            <h1 className="mb-6 text-center text-9xl font-extrabold">404</h1>
            <h3 className="mb-2 text-center text-4xl font-bold">Not Found</h3>
            <p className="text-2xl">
                The page you're looking for could not be found
            </p>
            <a
                href="/"
                className="text-blue mt-4 text-center text-lg underline"
            >
                Back to home
            </a>
        </div>
    );
}
