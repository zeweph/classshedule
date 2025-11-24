"use client";

import React, { useState, useEffect } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import axios from "axios";

interface UserSession {
  loggedIn: boolean;
  user?: {
    id: number;
    id_number: string;
    full_name: string;
    username: string;
    email: string;
    role: string;
    status: string;
    department_id: number;
    department_name: string;
  };
}

// ✅ Main App Wrapper
const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-lg">
        <SubmitFeedbackSection />
      </div>
    </div>
  );
};

// ✅ Feedback Section Component
const SubmitFeedbackSection: React.FC = () => {
  const [category, setCategory] = useState("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null); 

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ✅ Load user session once
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          withCredentials: true,
        });
        setSession(res.data);
        setIdNumber(res.data?.user?.id_number || "");
      } catch (err) {
        console.error("Failed to fetch session:", err);
        setSession({ loggedIn: false });
      }
    };
    checkSession();
  }, [API_URL]);

  // ✅ Handle Feedback Submission
  const handleSubmit = async () => {
    if (!category || !idNumber || !feedbackText.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_number: idNumber,
          category,
          message: feedbackText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowConfirmation(true);
        setCategory("");
        setFeedbackText("");
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render Section
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-lg mx-auto border border-gray-200">
      <h2 className="text-3xl font-bold text-blue-800 mb-4 flex items-center">
        <PencilSquareIcon className="h-8 w-8 mr-3 text-blue-600" />
        Submit Feedback
      </h2>

      {submitted && showConfirmation ?  (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-xl text-green-700 font-semibold mb-4 animate-pulse">
            Your feedback has been submitted to the department head. Thank you!
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition transform hover:scale-105"
          >
            New Feedback
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <label className="block mb-1 font-medium text-sm">
              Feedback Category
            </label>
            <select
              id="category"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">--Select Category--</option>
              <option value="general">General Feedback</option>
              <option value="department">Department Feedback</option>
            </select>
          </div>

          <div className="mb-3">
            <label
              htmlFor="feedback"
              className="block mb-2 font-medium text-gray-700"
            >
              Your Feedback
            </label>
            <textarea
              id="feedback"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </>
      )}
    </div>
  );
};

export default App;
