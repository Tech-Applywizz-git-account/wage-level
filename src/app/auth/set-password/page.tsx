"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Extract access_token and refresh_token from URL hash
  useEffect(() => {
    const urlHash = window.location.hash;

    // Extract access_token and refresh_token using regex
    const accessTokenMatch = urlHash.match(/access_token=([^&]+)/);
    const refreshTokenMatch = urlHash.match(/refresh_token=([^&]+)/);

    const token = accessTokenMatch ? accessTokenMatch[1] : null;
    const refresh = refreshTokenMatch ? refreshTokenMatch[1] : null;

    if (token && refresh) {
      setAccessToken(token);
      setRefreshToken(refresh);
    } else {
      setError("Tokens missing. Cannot authenticate.");
      setTimeout(() => (window.location.href = "/"), 5000); // Redirect if tokens are missing
    }
  }, []);

  // Password validation
  const validatePassword = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      showToast("Passwords do not match.", "error");
      return false;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters.");
      showToast("Password must be at least 5 characters.", "error");
      return false;
    }
    return true;
  };

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Hide toast after 5 seconds
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return; // If validation fails, stop the submit

    setIsLoading(true);

    // Send both tokens and new password to the backend for password update
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: accessToken, refreshToken, password }),
    });

    const result = await res.json();

    if (res.ok) {
      showToast("Password updated successfully!", "success");
      setTimeout(() => (window.location.href = "/"), 2000); // Redirect to homepage after success
    } else {
      showToast(result.error || "Error updating password", "error");
      setTimeout(() => (window.location.href = "/"), 5000); // Redirect after failure
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Set Your Password</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-blue-600 text-white rounded-md"
        >
          {isLoading ? "Setting..." : "Set Password"}
        </button>
      </form>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${toast.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm ${toast.type === "success" ? "text-green-700" : "text-red-700"}`}
              >
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
