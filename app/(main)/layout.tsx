import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="md:pl-64">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main id="main-content" className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
