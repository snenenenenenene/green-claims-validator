// app/claims/page.tsx
"use client";
import { LoadingSpinner } from "@/components/ui/base";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  ChevronRight,
  Clock,
  Search
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Claim {
  id: string;
  claim: string;
  createdAt: string;
  updatedAt: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'OUTDATED';
  progress?: number;
}

const getStatusConfig = (status: Claim['status']) => {
  switch (status) {
    case 'COMPLETED':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        text: 'Completed'
      };
    case 'IN_PROGRESS':
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        text: 'In Progress'
      };
    case 'OUTDATED':
      return {
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        text: 'Outdated'
      };
    default:
      return {
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        text: 'Unknown'
      };
  }
};

export default function ClaimsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/claims');
        const data = await response.json();

        if (response.ok) {
          setClaims(data.claims);
        } else {
          throw new Error(data.message || 'Failed to fetch claims');
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchClaims();
    }
  }, [session]);

  const filteredClaims = claims.filter(claim =>
    claim.claim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    return sortConfig.direction === 'asc'
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const handleClaimClick = (claim: Claim) => {
    router.push(`/claims/${claim.id}`);
  };

  console.log(sortedClaims)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
        <p className="mt-2 text-gray-600">
          View and manage your green claims validation progress
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search and Actions Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              New Claim
            </button>
          </div>
        </div>

        {/* Claims List */}
        {sortedClaims.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No claims found</h3>
            <p className="text-gray-500 mb-4">Start by creating your first green claim validation</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create your first claim
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortConfig({
                      key: 'updatedAt',
                      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    <div className="flex items-center">
                      Last Updated
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedClaims.map((claim) => {
                  const status = getStatusConfig(claim.status);
                  const StatusIcon = status.icon;

                  return (
                    <motion.tr
                      key={claim.id}
                      onClick={() => handleClaimClick(claim)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "tween", duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {claim.claim}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="mr-1 h-4 w-4" />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.status === 'IN_PROGRESS' && (
                          <div className="w-full max-w-xs">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                                <div
                                  style={{ width: `${claim.progress}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {claim.progress}% complete
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(claim.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}