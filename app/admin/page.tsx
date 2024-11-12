"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { User } from "@prisma/client";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  FileText,
  Search,
  Settings,
  Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  index: number;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
  index: number;
}

const StatCard = ({ title, value, icon, iconBg, iconColor, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
      <div className={cn("p-3 rounded-lg", iconBg)}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const ActionCard = ({ title, description, icon, gradient, onClick, index }: ActionCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "rounded-xl shadow-sm p-6 cursor-pointer",
      "hover:shadow-lg transition-all duration-300",
      gradient
    )}
  >
    <div className="flex items-center gap-4 text-white">
      {icon}
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
      <ArrowRight className="h-6 w-6 ml-auto" />
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users-with-claims");
        const data = await response.json();
        setUsers(data.users);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch("/api/admin/users", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalClaims = users.reduce((acc, user) => acc + (user._count?.claims || 0), 0);
  const activeUsers = users.filter(user => user.lastActive && new Date(user.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Claims",
      value: totalClaims,
      icon: <ClipboardCheck className="h-6 w-6 text-green-600" />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: <Activity className="h-6 w-6 text-purple-600" />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  const actions = [
    {
      title: "Review Claims",
      description: "Review and manage user claims and documents",
      icon: <FileText className="h-8 w-8" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      onClick: () => router.push('/admin/claims')
    },
    {
      title: "Admin Settings",
      description: "Configure system settings and permissions",
      icon: <Settings className="h-8 w-8" />,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      onClick: () => router.push('/admin/settings')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage users, review claims, and configure settings</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/admin/claims')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition-all duration-300"
              >
                <FileText className="h-4 w-4" />
                Review Claims
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} index={index} />
              ))}
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {actions.map((action, index) => (
                <ActionCard key={index} {...action} index={index} />
              ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="USER">Users</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claims
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <img
                              src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">{user.email}</td>
                        <td className="py-4 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user._count?.claims || 0} claims
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;