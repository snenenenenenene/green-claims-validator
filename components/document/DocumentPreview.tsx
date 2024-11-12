// components/document/DocumentPreview.tsx
import { Download, FileText, X } from 'lucide-react';

interface DocumentPreviewProps {
  document: {
    id: string;
    name: string;
    type: string;
    size: number;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreview = ({ document, isOpen, onClose }: DocumentPreviewProps) => {
  const isPDF = document.type === 'application/pdf';
  const isImage = document.type.startsWith('image/');

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="modal modal-open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {document.name}
              </h3>
              <p className="text-sm text-gray-500">
                {(document.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/documents/${document.id}`}
              download={document.name}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="mt-4 max-h-[70vh] overflow-auto">
          {isPDF ? (
            <iframe
              src={`/api/documents/${document.id}`}
              className="w-full h-[600px] border rounded"
            />
          ) : isImage ? (
            <img
              src={`/api/documents/${document.id}`}
              alt={document.name}
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-12">
              <FileText className="h-16 w-16 text-gray-400" />
              <p className="text-sm text-gray-500">
                Preview not available for this file type
              </p>
              <a
                href={`/api/documents/${document.id}`}
                download={document.name}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};