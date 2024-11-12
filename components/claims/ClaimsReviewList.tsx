// components/claims/ClaimsReviewList.tsx
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpDown,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Search,
  User,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import DocumentGrid from '../document/DocumentGrid';

interface ClaimWithUser {
  id: string;
  claim: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  progress?: number;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    reviewNote?: string;
    reviewedBy?: {
      name: string;
      email: string;
    };
  }>;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ClaimsReviewListProps {
  claims: ClaimWithUser[];
  isAdmin?: boolean;
  onReviewDocument?: (documentId: string, status: 'APPROVED' | 'REJECTED', note?: string) => Promise<void>;
}

export default function ClaimsReviewList ({ 
  claims, 
  isAdmin = false,
  onReviewDocument 
}: ClaimsReviewListProps) {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClaimWithUser | 'pendingDocuments';
    direction: 'asc' | 'desc';
  }>({ key: 'updatedAt', direction: 'desc' });

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedClaims = claims
    .filter(claim => {
      const matchesSearch = 
        claim.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || 
        claim.documents.some(doc => 
          statusFilter === 'PENDING' ? doc.status === 'PENDING' :
          statusFilter === 'APPROVED' ? doc.status === 'APPROVED' :
          doc.status === 'REJECTED'
        );

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      if (sortConfig.key === 'pendingDocuments') {
        return (
          (b.documents.filter(d => d.status === 'PENDING').length -
          a.documents.filter(d => d.status === 'PENDING').length) * direction
        );
      }

      return (
        String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key])) * direction
      );
    });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Documents</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSort('updatedAt')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                sortConfig.key === 'updatedAt'
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Calendar className="h-4 w-4" />
              Date
              <ArrowUpDown className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleSort('pendingDocuments')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                sortConfig.key === 'pendingDocuments'
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Filter className="h-4 w-4" />
              Pending
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredAndSortedClaims.map((claim) => (
          <motion.div
            key={claim.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Claim Header */}
            <div
              onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <img
                  src={claim.user.image || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${claim.user.email}`}
                  alt={claim.user.name || "User avatar"}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{claim.claim}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{claim.user.name || claim.user.email}</span>
                    <span className="text-gray-300">•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(claim.createdAt), 'PP')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Document Status Badges */}
                <div className="flex items-center gap-2">
                  {claim.documents.some(doc => doc.status === 'PENDING') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending Review
                    </span>
                  )}
                  {claim.documents.some(doc => doc.status === 'APPROVED') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {claim.documents.filter(doc => doc.status === 'APPROVED').length} Approved
                    </span>
                  )}
                  {claim.documents.some(doc => doc.status === 'REJECTED') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="mr-1 h-3 w-3" />
                      {claim.documents.filter(doc => doc.status === 'REJECTED').length} Rejected
                    </span>
                  )}
                </div>

                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-400 transition-transform",
                    expandedClaim === claim.id && "rotate-180"
                  )}
                />
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedClaim === claim.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      Supporting Documents
                    </h4>
                    <DocumentGrid
                      documents={claim.documents}
                      isAdmin={isAdmin}
                      onReview={onReviewDocument}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Empty State */}
        {filteredAndSortedClaims.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No claims have been submitted yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};