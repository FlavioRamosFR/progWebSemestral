"use client";

import { useState } from "react";
import { Sidebar } from "../componentes/sidebar";
import { Navbar } from "../componentes/navbar";
import { Footer } from "../componentes/footer";
import GlobalErrorHandler from "../componentes/GlobalErrorHandler";

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div
        className={`h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? "w-[250px]" : "w-0"
        }`}
      >
        <Sidebar onClose={toggleSidebar} />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overflow-y-auto">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <main id="main-content" className="p-6">
            <GlobalErrorHandler />
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
