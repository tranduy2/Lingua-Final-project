export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <main id="main-content">
                {children}
            </main>
        </div>
    );
}
