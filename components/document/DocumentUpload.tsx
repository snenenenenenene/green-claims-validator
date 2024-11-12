// components/document/DocumentUpload.tsx
import { cn } from '@/lib/utils';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

interface DocumentUploadProps {
	claimId: string;
	onUploadComplete?: (document: any) => void;
	maxFiles?: number;
	maxSize?: number; // in bytes
}

export const DocumentUpload = ({
	claimId,
	onUploadComplete,
	maxFiles = 5,
	maxSize = 5 * 1024 * 1024 // 5MB default
}: DocumentUploadProps) => {
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		setUploading(true);

		for (const file of acceptedFiles) {
			try {
				setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

				const formData = new FormData();
				formData.append('file', file);
				formData.append('claimId', claimId);

				const response = await axios.post('/api/documents', formData, {
					onUploadProgress: (progressEvent) => {
						if (progressEvent.total) {
							const progress = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total
							);
							setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
						}
					},
				});

				toast.success(`${file.name} uploaded successfully`);
				if (onUploadComplete) {
					onUploadComplete(response.data);
				}

			} catch (error) {
				console.error('Upload error:', error);
				toast.error(`Failed to upload ${file.name}`);
			}
		}

		setUploading(false);
		setUploadProgress({});
	}, [claimId, onUploadComplete]);

	const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
		onDrop,
		maxFiles,
		maxSize,
		accept: {
			'application/pdf': ['.pdf'],
			'image/*': ['.png', '.jpg', '.jpeg'],
			'application/msword': ['.doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
		}
	});

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={cn(
					"border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
					isDragActive
						? "border-blue-500 bg-blue-50"
						: "border-gray-300 hover:border-gray-400"
				)}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center gap-2 text-center">
					<Upload className={cn(
						"h-10 w-10 transition-colors",
						isDragActive ? "text-blue-500" : "text-gray-400"
					)} />
					<p className="text-sm font-medium text-gray-700">
						{isDragActive
							? "Drop files here"
							: "Drag files here or click to select"}
					</p>
					<p className="text-xs text-gray-500">
						PDF, Word documents, or images up to {maxSize / (1024 * 1024)}MB
					</p>
				</div>
			</div>

			{/* File List */}
			<AnimatePresence mode="popLayout">
				{acceptedFiles.length > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="space-y-2"
					>
						{acceptedFiles.map((file, index) => (
							<motion.div
								key={file.name}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ delay: index * 0.1 }}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center gap-3">
									<FileText className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-sm font-medium text-gray-700">
											{file.name}
										</p>
										<p className="text-xs text-gray-500">
											{(file.size / 1024).toFixed(1)} KB
										</p>
									</div>
								</div>
								{uploadProgress[file.name] !== undefined && (
									<div className="w-24">
										<div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-blue-500 transition-all duration-300"
												style={{ width: `${uploadProgress[file.name]}%` }}
											/>
										</div>
									</div>
								)}
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{uploading && (
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
				</div>
			)}
		</div>
	);
};