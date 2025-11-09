import React, { useEffect, useState } from "react";
import api from "../utils/api";

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/jobs');
            setJobs(res.data || []);
        } catch (err) { console.info('fetch jobs failed', err.message); setJobs([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchJobs(); }, []);

    const doAction = async (id, action) => {
        try {
            if (action === 'approve') await api.post(`/api/admin/jobs/${id}/approve`);
            if (action === 'delete') await api.delete(`/api/admin/jobs/${id}`);
            fetchJobs();
        } catch (err) { alert('Action failed: ' + err.message); }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Quản lý tin tuyển dụng</h2>
            <div className="bg-white border rounded-md overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Tiêu đề</th>
                            <th className="px-4 py-2 text-left">Công ty</th>
                            <th className="px-4 py-2 text-left">Phê duyệt</th>
                            <th className="px-4 py-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center">Đang tải...</td>
                            </tr>
                        ) : jobs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center">Không có tin tuyển dụng</td>
                            </tr>
                        ) : (
                            jobs.map(j => (
                                <tr key={j._id} className="border-t">
                                    <td className="px-4 py-2">{j._id}</td>
                                    <td className="px-4 py-2">{j.title}</td>
                                    <td className="px-4 py-2">{j.companyId?.name || j.companyName || ''}</td>
                                    <td className="px-4 py-2">{j.approved ? 'Đã duyệt' : 'Chưa duyệt'}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            {!j.approved && (
                                                <button
                                                    onClick={() => doAction(j._id, 'approve')}
                                                    className="px-2 py-1 bg-green-600 text-white rounded-md text-sm"
                                                >
                                                    Phê duyệt
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { if (confirm('Bạn có muốn gỡ tin này?')) doAction(j._id, 'delete'); }}
                                                className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                                            >
                                                Gỡ bỏ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminJobs;
