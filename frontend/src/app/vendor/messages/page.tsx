"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import shopMessagesService from "@/services/shopMessages";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MailOpen,
  Search,
  Trash2,
  Phone,
  User,
  Clock,
  ChevronLeft,
  MessageSquareText,
  Inbox,
  CheckCheck,
  AlertCircle,
} from "lucide-react";

interface Message {
  _id: string;
  senderName: string;
  senderPhone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  shopId: string;
}

type FilterType = "all" | "unread" | "read";

export default function VendorMessagesPage() {
  const { shop } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!shop?._id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await shopMessagesService.getShopMessages(shop._id);
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [shop?._id]);

  const handleMarkAsRead = async (msg: Message) => {
    if (msg.isRead) return;
    try {
      await shopMessagesService.markAsRead(msg._id);
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
      );
      if (selectedMessage?._id === msg._id) {
        setSelectedMessage({ ...msg, isRead: true });
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      handleMarkAsRead(msg);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setDeleteLoading(messageId);
    try {
      await shopMessagesService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Failed to delete message", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredMessages = messages
    .filter((msg) => {
      if (filter === "unread") return !msg.isRead;
      if (filter === "read") return msg.isRead;
      return true;
    })
    .filter((msg) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        msg.senderName.toLowerCase().includes(q) ||
        msg.senderPhone.includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHrs < 24) return `منذ ${diffHrs} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-DZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 font-bold">{error}</p>
          <button
            onClick={fetchMessages}
            className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold hover:bg-slate-200 transition text-slate-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 dir-rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <MessageSquareText className="w-8 h-8 text-emerald-700" />
            الرسائل الواردة
          </h1>
          <p className="text-slate-500 mt-1">
            الرسائل التي وصلتك من زوار موقعك
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
          >
            <Mail className="w-4 h-4 text-emerald-700" />
            <span className="text-sm font-bold text-emerald-700">
              {unreadCount} رسالة غير مقروءة
            </span>
          </motion.div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف أو المحتوى..."
            className="w-full rounded-2xl border border-slate-200 bg-white pr-11 pl-5 py-3.5 text-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: "الكل", count: messages.length },
              { key: "unread", label: "غير مقروءة", count: unreadCount },
              {
                key: "read",
                label: "مقروءة",
                count: messages.length - unreadCount,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {f.label}
              <span className="mr-1.5 text-xs opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Content */}
      {messages.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
            <Inbox className="w-12 h-12 text-slate-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">
              لا توجد رسائل بعد
            </h3>
            <p className="text-slate-500 mt-2 max-w-md">
              عندما يتواصل معك زبون عبر نموذج التواصل في موقعك، ستظهر رسائله هنا
            </p>
          </div>
        </motion.div>
      ) : filteredMessages.length === 0 ? (
        /* No Results */
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Search className="w-10 h-10 text-slate-400" />
          <p className="text-slate-500 font-medium">
            لا توجد نتائج مطابقة لبحثك
          </p>
        </div>
      ) : (
        /* Messages Grid */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((msg, idx) => (
                <motion.button
                  key={msg._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-right p-4 rounded-2xl transition-all duration-200 border group relative ${
                    selectedMessage?._id === msg._id
                      ? "bg-emerald-50 border-emerald-200 shadow-sm"
                      : msg.isRead
                      ? "bg-white border-slate-100 hover:bg-slate-50"
                      : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {/* Unread Indicator */}
                  {!msg.isRead && (
                    <span className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        msg.isRead
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm truncate ${
                            msg.isRead
                              ? "font-semibold text-slate-600"
                              : "font-bold text-slate-900"
                          }`}
                        >
                          {msg.senderName}
                        </h4>
                        <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 dir-ltr text-right">
                        {msg.senderPhone}
                      </p>
                      <p
                        className={`text-sm mt-1.5 line-clamp-2 leading-relaxed ${
                          msg.isRead ? "text-slate-500" : "text-slate-700"
                        }`}
                      >
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Message Detail Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-fit"
                >
                  {/* Detail Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center font-bold text-xl text-emerald-700 border border-emerald-200">
                        {selectedMessage.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {selectedMessage.senderName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-sm text-slate-500">
                            <Phone className="w-3.5 h-3.5" />
                            <span dir="ltr">{selectedMessage.senderPhone}</span>
                          </span>
                          {selectedMessage.isRead ? (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <CheckCheck className="w-3.5 h-3.5" />
                              مقروءة
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                              <Mail className="w-3.5 h-3.5" />
                              جديدة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!selectedMessage.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage)}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                          title="وضع كمقروءة"
                        >
                          <MailOpen className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        disabled={deleteLoading === selectedMessage._id}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50 shadow-sm"
                        title="حذف الرسالة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detail Body */}
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {formatFullDate(selectedMessage.createdAt)}
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                      <p className="text-base leading-[1.9] text-slate-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a
                        href={`tel:${selectedMessage.senderPhone}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-all shadow-sm"
                      >
                        <Phone className="w-4 h-4" />
                        اتصل بالمرسل
                      </a>
                      <a
                        href={`https://wa.me/${selectedMessage.senderPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 border border-emerald-700 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        <MessageSquareText className="w-4 h-4" />
                        رد عبر واتساب
                      </a>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* No Message Selected */
                <motion.div
                  key="empty-detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center py-24 gap-4 shadow-sm"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <ChevronLeft className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    اختر رسالة لعرض تفاصيلها
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
