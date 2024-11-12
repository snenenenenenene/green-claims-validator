// app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import React from 'react';
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  FileText,
  RefreshCw,
  ChevronDown,
  XCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  User
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  totalClaims: number;
  lastActive: string | null;
  claims: Array<{
    id: string;
    claim: string;
    createdAt: string;
    updatedAt: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progress?: number;
  }>;
}

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/users-with-claims");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put("/api/admin/users", { userId, role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUserDetails = (user: AdminUser) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-50 p-6 space-y-6"
    >
      {/* Claims Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Claims</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {user.claims.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Claims</h3>
              <p className="mt-1 text-sm text-gray-500">
                This user hasn't made any claims yet.
              </p>
            </div>
          ) : (
            user.claims.map(claim => (
              <div
                key={claim.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{claim.claim}</h4>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getStatusColor(claim.status)
                  )}>
                    {claim.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {claim.progress !== undefined && claim.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{claim.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${claim.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Created: {format(new Date(claim.createdAt), 'PP')}</span>
                  <span>Updated: {format(new Date(claim.updatedAt), 'PP')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header and Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Claims</h3>
                <p className="text-3xl font-bold text-green-600">
                  {users.reduce((acc, user) => acc + user.totalClaims, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(user => user.lastActive &&
                    new Date(user.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                  className="px-4 py-2 border text-black border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claims
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.image || `https://avatars.dicebear.com/api/micah/${user.email}.svg`}
                            alt={user.name || "User avatar"}
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1.5 text-sm border text-black border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.totalClaims} claims
                          </span>
                          {user.claims.some(claim => claim.status === 'IN_PROGRESS') && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastActive ? format(new Date(user.lastActive), 'PP') : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                            selectedUser === user.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {selectedUser === user.id ? 'Hide' : 'View'} Details
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              selectedUser === user.id && "rotate-180"
                            )}
                          />
                        </button>
                      </td>
                    </tr>
                    {/* Details Row */}
                    {selectedUser === user.id && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          {renderUserDetails(user)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No users have been registered yet"}
              </p>
            </div>
          )}

          {/* Pagination or Load More */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {/* Add pagination logic */ }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {/* Add pagination logic */ }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;