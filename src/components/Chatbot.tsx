"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  useSendChatMessageMutation,
  useGetChatSuggestionsQuery,
  useGetUserChatContextQuery,
  ChatMessage,
} from "@/store/chatbotApi";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Loading from "./Loading";

// Navigation route mappings
const navigationRoutes: Record<string, { path: string; label: string }> = {
  // Users
  "add user": { path: "/dashboard/users/create", label: "Add New User" },
  "create user": { path: "/dashboard/users/create", label: "Create User" },
  "new user": { path: "/dashboard/users/create", label: "Create New User" },
  "manage users": { path: "/dashboard/users", label: "User Management" },
  "user list": { path: "/dashboard/users", label: "User List" },
  "all users": { path: "/dashboard/users", label: "All Users" },

  // Vacations
  "apply vacation": {
    path: "/dashboard/vacations/apply",
    label: "Apply for Vacation",
  },
  "request vacation": {
    path: "/dashboard/vacations/apply",
    label: "Apply for Vacation",
  },
  "vacation request": {
    path: "/dashboard/vacations/apply",
    label: "Apply for Vacation",
  },
  "new vacation": {
    path: "/dashboard/vacations/apply",
    label: "Apply for Vacation",
  },
  "pending vacation": {
    path: "/dashboard/vacations/pending-chief",
    label: "Pending Vacations (Chief)",
  },
  "approve vacation": {
    path: "/dashboard/vacations/pending-chief",
    label: "Pending Vacations (Chief)",
  },
  "chief pending": {
    path: "/dashboard/vacations/pending-chief",
    label: "Chief Pending Vacations",
  },
  "principal pending": {
    path: "/dashboard/vacations/pending-principal",
    label: "Principal Pending Vacations",
  },
  "my vacations": {
    path: "/dashboard/vacations/my-vacations",
    label: "My Vacations",
  },
  "vacation history": {
    path: "/dashboard/vacations/my-vacations",
    label: "My Vacations",
  },
  "all vacations": { path: "/dashboard/vacations/all", label: "All Vacations" },
  "department vacation": {
    path: "/dashboard/vacations/department",
    label: "Department Vacations",
  },
  "vacation list": {
    path: "/dashboard/vacations",
    label: "Vacations Overview",
  },

  // Inventory
  inventory: { path: "/dashboard/inventory", label: "Inventory" },
  "manage inventory": {
    path: "/dashboard/inventory",
    label: "Inventory Management",
  },
  "inventory list": { path: "/dashboard/inventory", label: "Inventory List" },
  "inventory overview": {
    path: "/dashboard/inventory-overview",
    label: "Inventory Overview",
  },
  "view inventory": {
    path: "/dashboard/inventory-overview",
    label: "Inventory Overview",
  },

  // Labs
  labs: { path: "/dashboard/labs", label: "Labs" },
  "manage labs": { path: "/dashboard/labs", label: "Lab Management" },
  "lab list": { path: "/dashboard/labs", label: "Lab List" },
  "all labs": { path: "/dashboard/labs", label: "All Labs" },

  // Loans
  "request loan": { path: "/dashboard/loans/request", label: "Request Loan" },
  "borrow equipment": {
    path: "/dashboard/loans/request",
    label: "Request Loan",
  },
  "new loan": { path: "/dashboard/loans/request", label: "Request New Loan" },
  "loan request": { path: "/dashboard/loans/request", label: "Loan Request" },
  "my loans": { path: "/dashboard/loans/my-active", label: "My Active Loans" },
  "active loans": {
    path: "/dashboard/loans/my-active",
    label: "My Active Loans",
  },
  "my active loans": {
    path: "/dashboard/loans/my-active",
    label: "My Active Loans",
  },
  "all loans": { path: "/dashboard/loans", label: "All Loans" },
  "manage loans": { path: "/dashboard/loans", label: "Loan Management" },

  // Departments
  departments: { path: "/dashboard/departments", label: "Departments" },
  "manage departments": {
    path: "/dashboard/departments",
    label: "Department Management",
  },
  "department list": {
    path: "/dashboard/departments",
    label: "Department List",
  },
  "add department": {
    path: "/dashboard/departments/create",
    label: "Add Department",
  },
  "create department": {
    path: "/dashboard/departments/create",
    label: "Create Department",
  },
  "new department": {
    path: "/dashboard/departments/create",
    label: "Create New Department",
  },

  // Profile & Settings
  profile: { path: "/dashboard/profile", label: "My Profile" },
  "my profile": { path: "/dashboard/profile", label: "My Profile" },
  settings: { path: "/dashboard/settings", label: "Settings" },
  "my settings": { path: "/dashboard/settings", label: "Settings" },

  // Dashboard Home
  dashboard: { path: "/dashboard", label: "Dashboard Home" },
  home: { path: "/dashboard", label: "Dashboard Home" },
};

export default function Chatbot() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();
  const { data: suggestions } = useGetChatSuggestionsQuery();
  const { data: userContext } = useGetUserChatContextQuery();

  // Detect navigation intent from message
  const detectNavigationIntent = (
    text: string
  ): { path: string; label: string } | null => {
    const lowerText = text.toLowerCase();
    for (const [keyword, route] of Object.entries(navigationRoutes)) {
      if (lowerText.includes(keyword)) {
        return route;
      }
    }
    return null;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("kpi-ems-chat-history");
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("kpi-ems-chat-history", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Auto-open chatbot with welcome message after 5 seconds
  useEffect(() => {
    const autoOpenShown = sessionStorage.getItem("chatbot-auto-opened");

    if (!autoOpenShown && !hasAutoOpened && userContext?.user) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
        sessionStorage.setItem("chatbot-auto-opened", "true");

        // Add animated welcome message
        setTimeout(() => {
          setIsTyping(true);

          setTimeout(() => {
            const userName = userContext?.user?.name || "there";
            const welcomeMessages = [
              `👋 Hey ${userName}! Welcome back! I'm your AI assistant, here to make your life easier. Need help finding something? Just ask! 🚀`,
              `✨ Hello ${userName}! Great to see you! I'm here to help you navigate the system like a pro. What can I help you with today? 💼`,
              `🎉 Welcome ${userName}! Your friendly AI assistant reporting for duty! Got questions? I've got answers! Let's make today productive! 💪`,
              `👨‍💼 Hi ${userName}! Ready to tackle your tasks? I'm here to guide you through anything you need - from vacation requests to inventory management! 🎯`,
              `🌟 Hey there ${userName}! Your AI sidekick is here! Whether you need help with vacations, inventory, or just exploring the system - I'm all ears! 👂`,
            ];

            const randomWelcome =
              welcomeMessages[
                Math.floor(Math.random() * welcomeMessages.length)
              ];

            const welcomeMessage: ChatMessage = {
              role: "assistant",
              content: randomWelcome,
              timestamp: new Date().toISOString(),
            };

            setChatHistory([welcomeMessage]);
            setIsTyping(false);
          }, 1500); // Typing animation duration
        }, 300);
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [userContext, hasAutoOpened]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || isSending) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      // Send message to backend
      const response = await sendMessage({
        message: textToSend,
        chatHistory: chatHistory,
      }).unwrap();

      // Check if user's question has navigation intent
      const navIntent = detectNavigationIntent(textToSend);

      // Add assistant response to chat
      let assistantContent = response.response;

      // If navigation intent detected, append a helpful message
      if (navIntent) {
        assistantContent += `\n\n💡 Quick tip: Click the button below to go directly to the ${navIntent.label} page!`;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: assistantContent,
        timestamp: response.timestamp,
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem("kpi-ems-chat-history");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group hover:scale-110"
          aria-label="Open Chatbot"
        >
          <div className="relative">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            <SparklesIcon className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {t("chatbot.askMe") || "Ask me anything!"}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">KPI-EMS Assistant</h3>
                <p className="text-xs text-white/80">
                  {t("chatbot.alwaysHere") || "Always here to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatHistory.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-white/80 hover:text-white text-xs px-2 py-1 hover:bg-white/10 rounded transition-colors"
                  title={t("chatbot.clearChat") || "Clear chat"}
                >
                  {t("chatbot.clear") || "Clear"}
                </button>
              )}
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close Chatbot"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User Context Banner (if available) */}
          {userContext && userContext.user && (
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-blue-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {t("chatbot.loggedInAs") || "Logged in as"}{" "}
                  <strong>{userContext.user.name}</strong> (
                  {userContext.user.role})
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Show empty state only if no chat history and not typing */}
            {chatHistory.length === 0 && !isTyping && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("chatbot.welcome") || "Welcome to KPI-EMS Assistant!"}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t("chatbot.welcomeMessage") ||
                    "I can help you navigate the system, answer questions, and provide guidance."}
                </p>

                {/* Quick Suggestions */}
                {suggestions && suggestions.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      {t("chatbot.quickQuestions") || "Quick questions:"}
                    </p>
                    {suggestions.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-sm bg-white hover:bg-blue-50 text-gray-700 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        KPI-EMS Assistant
                      </span>
                    </div>
                  )}
                  <div
                    className={`text-sm whitespace-pre-wrap ${
                      msg.role === "assistant"
                        ? "prose prose-sm max-w-none"
                        : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, "<br />"),
                    }}
                  />

                  {/* Show navigation button if content mentions a page */}
                  {msg.role === "assistant" &&
                    (() => {
                      const navIntent = detectNavigationIntent(msg.content);
                      if (navIntent) {
                        return (
                          <button
                            onClick={() => {
                              router.push(navIntent.path);
                              setIsOpen(false);
                            }}
                            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium w-full justify-center group"
                          >
                            <span>📍 Go to {navIntent.label}</span>
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        );
                      }
                    })()}

                  <div
                    className={`text-xs mt-2 ${
                      msg.role === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-blue-600 animate-pulse" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show quick suggestions after welcome message */}
            {chatHistory.length === 1 &&
              chatHistory[0].role === "assistant" &&
              !isTyping &&
              suggestions &&
              suggestions.suggestions.length > 0 && (
                <div className="space-y-2 px-2">
                  <p className="text-xs text-gray-500 font-medium mb-2 text-center">
                    {t("chatbot.quickQuestions") || "Quick questions:"}
                  </p>
                  {suggestions.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-sm bg-white hover:bg-blue-50 text-gray-700 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("chatbot.typeMessage") || "Type your message..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isSending}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!message.trim() || isSending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {t("chatbot.poweredBy") || "Powered by EMS AI Assistant"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
