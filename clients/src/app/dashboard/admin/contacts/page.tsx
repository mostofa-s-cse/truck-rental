"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Calendar,
  Phone,
  User,
  MessageSquare,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { adminApi } from "@/lib/adminApi";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/ui/DashboardLayout";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContactStats {
  total: number;
  unread: number;
  read: number;
  recent: number;
}

export default function AdminContactMessagesPage() {
  const { successToast, errorToast, question } = useSweetAlert();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    read: 0,
    recent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">(
    "all"
  );

  // Fetch contact messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const isRead =
        filterStatus === "all" ? undefined : filterStatus === "read";
      const response = await adminApi.getContactMessages(
        currentPage,
        20,
        isRead
      );

      setMessages(response.messages);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      errorToast("Failed to load contact messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const statsData = await adminApi.getContactMessageStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [currentPage, filterStatus]);

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDetailModalOpen(true);

    // Mark as read if not already
    if (!message.isRead) {
      try {
        await adminApi.markContactMessageAsRead(message.id);
        // Update the message in the list
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          unread: prev.unread - 1,
          read: prev.read + 1,
        }));
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleToggleReadStatus = async (message: ContactMessage) => {
    try {
      if (message.isRead) {
        await adminApi.markContactMessageAsUnread(message.id);
        successToast("Message marked as unread");
      } else {
        await adminApi.markContactMessageAsRead(message.id);
        successToast("Message marked as read");
      }

      // Update the message in the list
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, isRead: !m.isRead } : m))
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        unread: message.isRead ? prev.unread + 1 : prev.unread - 1,
        read: message.isRead ? prev.read - 1 : prev.read + 1,
      }));
    } catch (error) {
      console.error("Error toggling read status:", error);
      errorToast("Failed to update message status");
    }
  };

  const handleDeleteMessage = async (message: ContactMessage) => {
    const result = await question(
      `Are you sure you want to delete this message from ${message.name}?`,
      "Delete Message"
    );

    if (result.isConfirmed) {
      try {
        await adminApi.deleteContactMessage(message.id);
        successToast("Message deleted successfully");

        // Remove from list
        setMessages((prev) => prev.filter((m) => m.id !== message.id));

        // Update stats
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          unread: message.isRead ? prev.unread : prev.unread - 1,
          read: message.isRead ? prev.read - 1 : prev.read,
        }));

        // Close modal if this message is open
        if (selectedMessage?.id === message.id) {
          setIsDetailModalOpen(false);
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        errorToast("Failed to delete message");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout
        title="Contact Management"
        subtitle="Manage all contact messages in the system"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Contact Messages
            </h1>
            <p className="text-gray-600">
              Manage customer inquiries and support requests
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.unread}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.read}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent (7 days)</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.recent}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterStatus("all")}
                  variant={filterStatus === "all" ? "primary" : "outline"}
                  className="text-sm"
                >
                  All Messages
                </Button>
                <Button
                  onClick={() => setFilterStatus("unread")}
                  variant={filterStatus === "unread" ? "primary" : "outline"}
                  className="text-sm"
                >
                  Unread ({stats.unread})
                </Button>
                <Button
                  onClick={() => setFilterStatus("read")}
                  variant={filterStatus === "read" ? "primary" : "outline"}
                  className="text-sm"
                >
                  Read ({stats.read})
                </Button>
              </div>

              <Button
                onClick={() => {
                  fetchMessages();
                  fetchStats();
                }}
                variant="outline"
                className="text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          !message.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleViewMessage(message)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {message.isRead ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <Check className="w-4 h-4 mr-1" />
                              Read
                            </span>
                          ) : (
                            <span className="flex items-center text-orange-600 text-sm font-medium">
                              <Mail className="w-4 h-4 mr-1" />
                              New
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {message.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {message.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 truncate max-w-xs">
                            {message.subject || "No subject"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleReadStatus(message);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title={
                                message.isRead
                                  ? "Mark as unread"
                                  : "Mark as read"
                              }
                            >
                              {message.isRead ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(message);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Message Detail Modal */}
          {isDetailModalOpen && selectedMessage && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Message Details
                  </h2>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* From Information */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedMessage.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-base text-blue-600 hover:text-blue-800"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>

                    {selectedMessage.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="text-base text-blue-600 hover:text-blue-800"
                          >
                            {selectedMessage.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedMessage.subject && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Subject</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedMessage.subject}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Received</p>
                        <p className="text-base text-gray-900">
                          {formatDate(selectedMessage.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="border-t pt-6">
                    <p className="text-sm text-gray-500 mb-2">Message</p>
                    <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-900">
                      {selectedMessage.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleToggleReadStatus(selectedMessage)}
                      variant="outline"
                      className="flex-1"
                    >
                      {selectedMessage.isRead ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Mark as Unread
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Mark as Read
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDeleteMessage(selectedMessage)}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
