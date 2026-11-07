"use client";

import { useState } from "react";
import { Sidebar } from "../componentes/sidebar";
import { Navbar } from "../componentes/navbar";
import { Footer } from "../componentes/footer";

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
      
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main   id="main-content"
                className="min-h-0 flex-1 overflow-y-auto p-6 justify-between flex flex-col">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}