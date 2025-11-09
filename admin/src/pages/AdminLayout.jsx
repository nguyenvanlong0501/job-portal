import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="flex gap-6 min-h-screen">
            <aside className="w-64 bg-white border rounded-md p-4 h-fit sticky top-6">
                <h3 className="text-lg font-semibold">Bảng quản trị</h3>
                <nav className="mt-4 flex flex-col gap-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `block w-full px-3 h-10 flex items-center rounded-md ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            } focus:outline-none`
                        }
                    >
                        Tổng quan
                    </NavLink>
                    <NavLink
                        to="/users"
                        className={({ isActive }) =>
                            `block w-full px-3 h-10 flex items-center rounded-md ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            } focus:outline-none`
                        }
                    >
                        Người dùng
                    </NavLink>
                    <NavLink
                        to="/jobs"
                        className={({ isActive }) =>
                            `block w-full px-3 h-10 flex items-center rounded-md ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            } focus:outline-none`
                        }
                    >
                        Tin tuyển dụng
                    </NavLink>
                    <NavLink
                        to="/stats"
                        className={({ isActive }) =>
                            `block w-full px-3 h-10 flex items-center rounded-md ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            } focus:outline-none`
                        }
                    >
                        Thống kê
                    </NavLink>
                </nav>
            </aside>
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;