import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import api from "../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminStats = () => {
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

    const data = {
        labels: ["Người dùng", "Tin tuyển dụng", "Lượt ứng tuyển", "Doanh nghiệp"],
        datasets: [
            {
                label: "Số lượng",
                data: [stats.users, stats.jobs, stats.applications, stats.companies],
                backgroundColor: ["#2563EB", "#F59E0B", "#10B981", "#6B7280"],
            },
        ],
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Thống kê hệ thống</h2>
            <div className="p-4 bg-white border rounded-md">
                <Bar data={data} />
            </div>
            <div className="mt-4 p-4 bg-white border rounded-md">
                <h3 className="font-medium mb-2">Báo cáo nhanh</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <li>Người dùng: {stats.users}</li>
                    <li>Tin tuyển dụng: {stats.jobs}</li>
                    <li>Lượt ứng tuyển: {stats.applications}</li>
                    <li>Doanh nghiệp hoạt động: {stats.companies}</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminStats;
