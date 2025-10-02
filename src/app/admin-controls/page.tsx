"use client";

import { useState } from "react";
import {
  Settings,
  Users,
  Shield,
  Database,
  BarChart3,
  Plus,
  Copy,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminControls() {
  const { isAdmin } = useAuth();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "lead">("lead");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [createUserError, setCreateUserError] = useState("");

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Copy password to clipboard
  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy password:", err);
    }
  };

  // Create new user

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserRole) {
      setCreateUserError("Please fill in all fields");
      return;
    }

    setIsCreatingUser(true);
    setCreateUserError("");

    try {
      // Call server API
      const response = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUserEmail, role: newUserRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Show error inside modal
        setCreateUserError(result.error || "Failed to create user");
        return;
      }

      // Success → show password modal
      setGeneratedPassword(result.password); // temp password from server
      setShowPasswordModal(true);
      setShowCreateUser(false);
      setNewUserEmail("");
      setNewUserRole("lead");

      showToast(`User ${newUserEmail} created successfully!`, "success");
    } catch (err) {
      console.error(err);
      setCreateUserError("Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Reset create user form
  const resetCreateUserForm = () => {
    setShowCreateUser(false);
    setNewUserEmail("");
    setNewUserRole("lead");
    setCreateUserError("");
  };

  // Close password modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPassword("");
    setPasswordCopied(false);
  };
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Controls
          </h1>
          <p className="text-lg text-gray-600">
            Manage users, settings, and system configuration
          </p>
        </div>

        {/* User Management Section */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions. Create new users and
              assign admin or lead roles.
            </p>

            {/* Create User Form Modal */}
            {showCreateUser && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Create New User
                    </h3>
                    <button
                      onClick={resetCreateUserForm}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label
                          htmlFor="user-email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email address
                        </label>
                        <input
                          id="user-email"
                          name="user-email"
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter user email"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="user-role"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Role
                        </label>
                        <select
                          id="user-role"
                          name="user-role"
                          value={newUserRole}
                          onChange={(e) =>
                            setNewUserRole(e.target.value as "admin" | "lead")
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="lead">Lead</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {createUserError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-red-700">
                                {createUserError}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={resetCreateUserForm}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingUser || !newUserEmail}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingUser ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </div>
                          ) : (
                            "Create User"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Planned Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                User Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions. Add new users and
              assign admin or lead roles.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>

          {/* Database Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Database Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor database performance, manage data imports, and configure
              database settings.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>

          {/* Analytics Configuration */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Analytics Configuration
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure analytics dashboards, set up automated reports, and
              customize data views.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>

          {/* System Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                System Settings
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure application settings, manage integrations, and customize
              the user experience.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>

          {/* Security & Compliance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Security & Compliance
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage security policies, audit logs, and compliance settings for
              data protection.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>

          {/* API Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                API Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure API endpoints, manage rate limits, and monitor API usage
              and performance.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need admin assistance? Contact your system administrator for help
            with user management and system configuration.
          </p>
        </div>

        {/* Password Display Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  User Created Successfully
                </h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  The user has been created successfully. Here is their
                  temporary password:
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900 break-all">
                      {generatedPassword}
                    </code>
                    <button
                      onClick={copyPassword}
                      className="ml-2 flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {passwordCopied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Please save this password securely and share it with the user.
                  They should change it after their first login.
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={closePasswordModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`rounded-md p-4 shadow-lg ${
                toast.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {toast.type === "success" ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm ${
                      toast.type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
