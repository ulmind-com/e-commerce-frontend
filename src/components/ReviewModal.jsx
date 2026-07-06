import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const ReviewModal = ({ isOpen, onClose, productId, token, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const res = await axios.post(`${API}/reviews`, {
        product_id: productId,
        rating,
        review_text: reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onReviewAdded(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setReviewText('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Write a Review</h3>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        fill={(hoveredRating || rating) >= star ? "#f59e0b" : "none"}
                        className={(hoveredRating || rating) >= star ? "text-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Share your experience
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="What did you like or dislike?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-sm text-slate-700"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                  ) : (
                    'Post Review'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
