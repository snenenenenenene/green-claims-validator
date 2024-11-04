"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AdminUser, AdminClaim, TableFilters } from "@/types/admin";
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  ChevronDown,
  FileText,
  UserCog,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { DateRangePicker } from 'react-date-range';
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    role: "ALL",
    status: "ALL",
    dateRange: [null, null],
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const handleDocumentApproval = async (documentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`/api/admin/documents/${documentId}`, { status });
      // Update local state
      toast.success(`Document ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Failed to update document status:", error);
      toast.error("Failed to update document status");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = filters.role === 'ALL' || user.role === filters.role;
    
    const matchesDateRange = !filters.dateRange[0] || !filters.dateRange[1] || 
      (new Date(user.lastActive) >= filters.dateRange[0] &&
       new Date(user.lastActive) <= filters.dateRange[1]);

    return matchesSearch && matchesRole && matchesDateRange;
  });

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
          {user.claims.map(claim => (
            <div
              key={claim.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">{claim.claim}</h4>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  claim.status === 'COMPLETED' ? "bg-green-100 text-green-800" :
                  claim.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                )}>
                  {claim.status}
                </span>
              </div>

              {claim.progress !== undefined && (
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

              {/* Documents Section */}
              {claim.documents && claim.documents.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Supporting Documents</h5>
                  <div className="space-y-2">
                    {claim.documents.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDocumentApproval(doc.id, 'APPROVED')}
                            className="p-1 text-green-500 hover:bg-green-50 rounded-md"
                            title="Approve document"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDocumentApproval(doc.id, 'REJECTED')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                            title="Reject document"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-md"
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500">
                <span>Created: {format(new Date(claim.createdAt), 'PP')}</span>
                <span>Last updated: {format(new Date(claim.lastUpdated), 'PP')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  showFilters
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  showFilters && "rotate-180"
                )} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={filters.role}
                      onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as UserRole | 'ALL' }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <DateRangePicker
                      ranges={[{
                        startDate: filters.dateRange[0] || new Date(),
                        endDate: filters.dateRange[1] || new Date(),
                        key: 'selection'
                      }]}
                      onChange={({ selection }) => setFilters(prev => ({
                        ...prev,
                        dateRange: [selection.startDate!, selection.endDate!]
                      }))}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
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
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.lastActive), 'PP')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                              selectedUser === user.id
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            {selectedUser === user.id ? "Hide" : "View"} Details
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform",
                              selectedUser === user.id && "rotate-180"
                            )} />
                          </button>
                          <div className="relative">
                            <button
                              className="p-1 hover:bg-gray-100 rounded-md"
                              onClick={() => {/* Add dropdown menu logic */}}
                            >
                              <MoreHorizontal className="h-5 w-5 text-gray-400" />
                            </button>
                            {/* Add dropdown menu here */}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {selectedUser === user.id && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          {renderUserDetails(user)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination or Load More */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {/* Add load more logic */}}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Load More
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <UserCog className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(user => 
                    new Date(user.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;