// components/document/DocumentGrid.tsx
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  File,
  FileText,
  Image as ImageIcon,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { DocumentPreview } from './DocumentPreview';

interface Document {
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
}

interface DocumentGridProps {
  documents: Document[];
  onReview?: (documentId: string, status: 'APPROVED' | 'REJECTED', note?: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function DocumentGrid({ documents, onReview, isAdmin = false }: DocumentGridProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const getStatusInfo = (status: Document['status']) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          label: 'Approved'
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          label: 'Rejected'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          label: 'Pending Review'
        };
    }
  };

  const handleReview = async (documentId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!onReview) return;

    setIsReviewing(true);
    try {
      await onReview(documentId, status, reviewNote);
      setReviewNote('');
      setSelectedDocument(null);
    } catch (error) {
      console.error('Review error:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => {
          const FileIcon = getFileIcon(document.type);
          const statusInfo = getStatusInfo(document.status);
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Document Preview Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <FileIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {(document.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1",
                    statusInfo.bgColor,
                    statusInfo.color
                  )}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </div>
                </div>
              </div>

              {/* Document Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Uploaded {format(new Date(document.createdAt), 'PP')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={`/api/documents/${document.id}`}
                      download={document.name}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Admin Review Section */}
                {isAdmin && document.status === 'PENDING' && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      placeholder="Add review note (optional)"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(document.id, 'APPROVED')}
                        disabled={isReviewing}
                        className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(document.id, 'REJECTED')}
                        disabled={isReviewing}
                        className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Details */}
                {document.reviewNote && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-700">{document.reviewNote}</p>
                    {document.reviewedBy && (
                      <p className="mt-1 text-xs text-gray-500">
                        Reviewed by {document.reviewedBy.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {documents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              No documents have been uploaded yet
            </p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
};