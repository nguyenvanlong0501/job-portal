import React, { useEffect, useState } from "react";
import api from "../utils/api";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users");
            setUsers(res.data || []);
        } catch (err) {
            console.info("fetch users failed:", err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const doAction = async (id, action) => {
        try {
            if (action === 'lock') await api.post(`/api/admin/users/${id}/lock`);
            if (action === 'unlock') await api.post(`/api/admin/users/${id}/unlock`);
            if (action === 'delete') await api.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Action failed: ' + err.message);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Quản lý người dùng</h2>
            <div className="bg-white border rounded-md overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Tên</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Vai trò</th>
                            <th className="px-4 py-2 text-left">Trạng thái</th>
                            <th className="px-4 py-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center">Loading...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center">No users</td>
                            </tr>
                        ) : (
                            users.map(u => (
                                <tr key={u._id} className="border-t">
                                    <td className="px-4 py-2">{u._id}</td>
                                    <td className="px-4 py-2">{u.name}</td>
                                    <td className="px-4 py-2">{u.email}</td>
                                    <td className="px-4 py-2">{u.role === 'candidate' && 'Người ứng tuyển'}
                                        {u.role === 'company' && 'Doanh nghiệp'}</td>
                                    <td className="px-4 py-2">{u.locked ? 'Đã khóa' : 'Hoạt động'}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => doAction(u._id, u.locked ? 'unlock' : 'lock')}
                                                className="px-2 py-1 bg-yellow-500 text-white rounded-md text-sm"
                                            >
                                                {u.locked ? 'Mở khóa' : 'Khóa'}
                                            </button>
                                            <button
                                                onClick={() => { if (confirm('Bạn có chắc chắn muốn xóa?')) doAction(u._id, 'delete'); }}
                                                className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                                            >
                                                Xóa
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

export default AdminUsers;
