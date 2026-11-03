import { ChevronLeft, Menu } from "lucide-react";

interface NavbarProps {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export function Navbar({
    sidebarOpen,
    toggleSidebar,
}: NavbarProps) {
    return (
        <header className="flex h-16 items-center px-6">
            <button
                type="button"
                onClick={toggleSidebar}
                aria-label={sidebarOpen ? "Recolher menu" : "Abrir menu"}
            >
                {sidebarOpen ? (
                    <ChevronLeft size={24} />
                ) : (
                    <Menu size={24} />
                )}
            </button>
        </header>
    )
}