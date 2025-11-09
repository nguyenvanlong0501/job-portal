import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminJobs from "./pages/AdminJobs";
import AdminStats from "./pages/AdminStats";

const App = () => {
    const logoUrl = import.meta.env.VITE_FRONTEND_ORIGIN || "http://localhost:5173";

    return (
        <div className="w-[90%] m-auto overflow-hidden min-h-screen flex flex-col">
            {/* Top: only centered logo */}
            <header className="py-6">
                <div className="flex justify-center">
                    <a href="/" className="flex items-center">
                        <img src={`${logoUrl}/src/assets/logo.png`} alt="SuperJob Logo" className="w-32" />
                    </a>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="jobs" element={<AdminJobs />} />
                        <Route path="stats" element={<AdminStats />} />
                    </Route>
                </Routes>
            </main>

            {/* Footer nav centered */}
            <footer className="py-6">
                <nav className="flex justify-center">
                    <ul className="flex gap-6 text-sm text-gray-600">
                        <li><a href="/" className="hover:text-blue-600">Trang chủ</a></li>
                        <li><a href="/all-jobs/all" className="hover:text-blue-600">Tất cả công việc</a></li>
                        <li><a href="/about" className="hover:text-blue-600">Về chúng tôi</a></li>
                        <li><a href="/terms" className="hover:text-blue-600">Điều khoản</a></li>
                    </ul>
                </nav>
            </footer>
        </div>
    );
};

export default App;
