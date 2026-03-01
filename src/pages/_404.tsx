export default function NotFoundPage() {
    return (
        <div className="absolute top-1/2 left-0 flex w-full -translate-y-1/2 flex-col text-center">
            <h1 className="text-6xl font-extrabold sm:text-9xl">404</h1>
            <h3 className="text-2xl font-bold sm:text-4xl">Not Found</h3>
            <p className="mx-8 my-4 text-lg sm:text-2xl">
                The page you're looking for could not be found
            </p>
            <a href="/" className="text-blue underline sm:text-lg">
                Back to home
            </a>
        </div>
    );
}
