"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewNote?: string;
  reviewedBy?: {
    name: string;
    email: string;
  };
}

interface Claim {
  id: string;
  claim: string;
  createdAt: string;
  status: string;
  documents: Document[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  category: string;
  description?: string;
  index: number;
}

interface InsightCardProps {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  impact: number;
  index: number;
}

const MetricCard = ({ title, value, change, category, description, index }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.5,
      delay: index * 0.1,
      ease: [0.23, 1, 0.32, 1]
    }}
    whileHover={{
      y: -4,
      transition: { duration: 0.2 },
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
    }}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-gradient-to-br from-green-50 to-transparent rounded-full opacity-50" />
    <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold">{value}</h3>
      {change && (
        <div className={`flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      )}
    </div>
    {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    <div className="mt-4">
      <span
        className={cn("px-2 py-1 text-xs font-medium rounded-full", {
          "bg-blue-50 text-blue-600": category === "evidence",
          "bg-purple-50 text-purple-600": category === "impact",
          "bg-emerald-50 text-emerald-600": category === "score"
        })}
      >
        {category}
      </span>
    </div>
  </motion.div>
);

const InsightCard = ({ title, description, severity, impact, index }: InsightCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div
        className={cn("p-2 rounded-lg", {
          "bg-red-50 text-red-500": severity === "high",
          "bg-amber-50 text-amber-500": severity === "medium",
          "bg-green-50 text-green-500": severity === "low"
        })}
      >
        <Target className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          <span
            className={cn("text-sm px-2 py-1 rounded-full", {
              "bg-red-50 text-red-500": severity === "high",
              "bg-amber-50 text-amber-500": severity === "medium",
              "bg-green-50 text-green-500": severity === "low"
            })}
          >
            {severity} priority
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Impact</span>
            <span className="text-sm font-medium">{impact}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const rawScore = searchParams.get("weight") || "0";
  const score = Math.max(0, Math.min(100, (1 - parseFloat(rawScore)) * 100));

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await fetch(`/api/claims/${params.claimId}`);
        if (!response.ok) throw new Error("Failed to fetch claim");
        const data = await response.json();
        setClaim(data.claim);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load claim details");
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [params.claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Claim Not Found
          </h2>
          <p className="text-gray-600">
            The claim you're looking for doesn't exist or you don't have access to
            it.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const metrics = [
    {
      title: "Overall Score",
      value: `${score.toFixed(1)}%`,
      change: 12,
      category: "score",
      description: "Based on comprehensive analysis"
    },
    {
      title: "Document Quality",
      value: "Strong",
      change: 8,
      category: "evidence",
      description: "Well-documented claims"
    },
    {
      title: "Assessment",
      value: "Positive",
      change: -3,
      category: "impact",
      description: "Benefits verified"
    }
  ];

  const insights = [
    {
      title: "Strong Documentation",
      description: "Your claims are well-supported by verifiable data",
      severity: "low",
      impact: 85
    },
    {
      title: "Review Status",
      description: "Document review process ongoing",
      severity: "medium",
      impact: 65
    }
  ];

  const totalDocuments = claim.documents.length;
  const approvedDocuments = claim.documents.filter(d => d.status === "APPROVED").length;
  const pendingDocuments = claim.documents.filter(d => d.status === "PENDING").length;
  const rejectedDocuments = claim.documents.filter(d => d.status === "REJECTED").length;

  return (
    <div className="relative min-h-screen">
      <div ref={containerRef} className="h-screen overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <motion.h1
                style={{ opacity: headerOpacity, scale: headerScale }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Analysis Results
              </motion.h1>
              <p className="text-sm text-gray-500">Claim: {claim.claim}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Risk Score Card */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Risk Score</h3>
                    <p className="text-sm text-gray-500">
                      Based on document analysis and questionnaire
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {score.toFixed(1)}%
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Tabs */}
              <div>
                <div className="flex space-x-1 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab(0)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium leading-5 text-gray-700",
                      "focus:outline-none",
                      activeTab === 0
                        ? "border-b-2 border-blue-500"
                        : "hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    Results Overview
                  </button>
                  <button
                    onClick={() => setActiveTab(1)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium leading-5 text-gray-700",
                      "focus:outline-none",
                      activeTab === 1
                        ? "border-b-2 border-blue-500"
                        : "hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    Document Review
                  </button>
                </div>

                <div className="mt-6">
                  {activeTab === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {metrics.map((metric, index) => (
                          <MetricCard key={index} {...metric} index={index} />
                        ))}
                      </div>

                      {/* Insights Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {insights.map((insight, index) => (
                          <InsightCard key={index} {...insight} index={index} />
                        ))}
                      </div>

                      {/* Placeholder for charts */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Detailed Analysis
                        </h3>
                        <p className="text-gray-500">
                          Charts and additional analysis metrics will appear here
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Document Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-600">Total</p>
                              <p className="text-xl font-bold text-gray-900">{totalDocuments}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-600">Approved</p>
                              <p className="text-xl font-bold text-gray-900">{approvedDocuments}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="text-sm text-gray-600">Pending</p>
                              <p className="text-xl font-bold text-gray-900">{pendingDocuments}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="text-sm text-gray-600">Rejected</p>
                              <p className="text-xl font-bold text-gray-900">{rejectedDocuments}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document List and Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Document List */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Documents
                          </h3>
                          <div className="space-y-3">
                            {claim.documents.map((doc) => (
                              <div
                                key={doc.id}
                                onClick={() => setSelectedDocument(doc)}
                                className={cn(
                                  "p-4 rounded-xl border border-gray-200 cursor-pointer transition-all duration-200",
                                  selectedDocument?.id === doc.id
                                    ? "bg-blue-50 border-blue-200"
                                    : "hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {doc.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                                      </p>
                                    </div>
                                  </div>
                                  {getStatusIcon(doc.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Document Details */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Document Details
                          </h3>
                          {selectedDocument ? (
                            <div className="bg-gray-50 rounded-xl p-6">
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(selectedDocument.status)}
                                    <span className="font-medium text-gray-900">
                                      {selectedDocument.status}
                                    </span>
                                  </div>
                                </div>

                                {selectedDocument.reviewedBy && (
                                  <div>
                                    <p className="text-sm text-gray-600">Reviewed By</p>
                                    <p className="font-medium text-gray-900 mt-1">
                                      {selectedDocument.reviewedBy.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {selectedDocument.reviewedBy.email}
                                    </p>
                                  </div>
                                )}

                                {selectedDocument.reviewNote && (
                                  <div>
                                    <p className="text-sm text-gray-600">Review Note</p>
                                    <p className="text-gray-900 mt-1">
                                      {selectedDocument.reviewNote}
                                    </p>
                                  </div>
                                )}

                                <div>
                                  <p className="text-sm text-gray-600">Document Info</p>
                                  <div className="mt-1 space-y-1">
                                    <p className="text-sm text-gray-900">
                                      Type: {selectedDocument.type}
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      Size: {(selectedDocument.size / 1024).toFixed(2)} KB
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      Uploaded: {format(new Date(selectedDocument.createdAt), "PPP")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-600">
                                Select a document to view details
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}