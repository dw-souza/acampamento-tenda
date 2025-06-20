import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AdminNavbar from "./AdminNavbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <main className="flex-grow w-full">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout;
