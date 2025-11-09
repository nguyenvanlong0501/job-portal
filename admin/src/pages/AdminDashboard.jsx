import React, { useEffect, useState } from "react";
import api from "../utils/api";

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0, companies: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/api/admin/stats");
                setStats(res.data || {});
            } catch (err) {
                console.info("stats fetch failed:", err.message);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Tổng quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white border rounded-md">
                    <p className="text-sm text-gray-500">Người dùng</p>
                    <p className="text-2xl font-bold">{stats.users}</p>
                </div>
                <div className="p-4 bg-white border rounded-md">
                    <p className="text-sm text-gray-500">Tin tuyển dụng</p>
                    <p className="text-2xl font-bold">{stats.jobs}</p>
                </div>
                <div className="p-4 bg-white border rounded-md">
                    <p className="text-sm text-gray-500">Lượt ứng tuyển</p>
                    <p className="text-2xl font-bold">{stats.applications}</p>
                </div>
                <div className="p-4 bg-white border rounded-md">
                    <p className="text-sm text-gray-500">Doanh nghiệp</p>
                    <p className="text-2xl font-bold">{stats.companies}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
