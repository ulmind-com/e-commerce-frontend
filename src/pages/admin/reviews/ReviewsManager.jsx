import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MessageSquareReply,
  FileText,
  Star,
  Image as ImageIcon,
  MoreVertical,
  ShieldCheck,
  MapPin,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const ReviewsManager = ({ token, filterDefault = 'All' }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(filterDefault);
  const [search, setSearch] = useState('');
  
  // Modals
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setFilter(filterDefault);
  }, [filterDefault]);

  useEffect(() => {
    fetchReviews();
  }, [filter, search]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/reviews?status=${filter === 'All' ? '' : filter}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, status) => {
    try {
      await axios.put(`${API}/admin/reviews/${reviewId}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  const handleReply = async () => {
    if (!selectedReview) return;
    try {
      await axios.put(`${API}/admin/reviews/${selectedReview._id}/reply`, { admin_reply: replyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert('Failed to send reply');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Pending', 'Published', 'Rejected', 'Archived'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 border border-amber-500' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-sm"
            />
          </div>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
           <div className="p-8 text-center space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse"></div>)}
           </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-sm">
              <MessageSquareQuote size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No reviews found</h3>
            <p className="text-sm text-gray-500 max-w-sm">No reviews match your current filters. Try adjusting your search or filter settings.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-gray-50/50 transition-colors group flex flex-col xl:flex-row gap-6">
                
                {/* Left: Review Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? "fill-amber-500" : "text-gray-300"} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-gray-900">{review.title || 'Review'}</span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{review.review_text}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, i) => (
                         <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400 cursor-pointer hover:border-amber-300 transition-colors">
                            <ImageIcon size={20} />
                         </div>
                      ))}
                    </div>
                  )}

                  {review.admin_reply && (
                    <div className="mt-4 p-4 bg-indigo-50/50 border-l-4 border-indigo-400 rounded-r-xl">
                      <p className="text-xs font-bold text-indigo-800 mb-1 flex items-center gap-2"><MessageSquareReply size={14}/> Official Reply</p>
                      <p className="text-sm text-indigo-900">{review.admin_reply}</p>
                    </div>
                  )}
                </div>

                {/* Right: Meta & Actions */}
                <div className="xl:w-72 flex flex-col gap-4 border-t xl:border-t-0 xl:border-l border-gray-100 pt-4 xl:pt-0 xl:pl-6 shrink-0">
                   
                   {/* Meta */}
                   <div className="space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-500">Status</span>
                         <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(review.status)}`}>
                            {review.status}
                         </span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-500">Customer</span>
                         <span className="text-xs font-bold text-gray-900">{review.user_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-500">Date</span>
                         <span className="text-xs font-bold text-gray-900">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      {(review.device || review.location) && (
                        <div className="pt-2 border-t border-gray-100 flex gap-3 text-gray-400">
                          {review.device && <span className="flex items-center gap-1 text-[10px] font-bold"><Smartphone size={12}/> {review.device}</span>}
                          {review.location && <span className="flex items-center gap-1 text-[10px] font-bold"><MapPin size={12}/> {review.location}</span>}
                        </div>
                      )}
                   </div>

                   {/* Actions */}
                   <div className="mt-auto flex flex-wrap gap-2">
                      {review.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(review._id, 'Published')} className="flex-1 min-w-[100px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => handleUpdateStatus(review._id, 'Rejected')} className="flex-1 min-w-[100px] px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {review.status !== 'Pending' && (
                        <button onClick={() => handleUpdateStatus(review._id, 'Pending')} className="flex-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                          <ShieldAlert size={14} /> Re-evaluate
                        </button>
                      )}
                      
                      <button 
                        onClick={() => { setSelectedReview(review); setReplyText(review.admin_reply || ''); }}
                        className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
                      >
                        <MessageSquareReply size={16} />
                      </button>
                      <button className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                        <MoreVertical size={16} />
                      </button>
                   </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><MessageSquareReply size={20} className="text-indigo-500" /> Public Reply</h3>
                  <p className="text-xs text-gray-500">Replying to {selectedReview.user_name}</p>
                </div>
                <button onClick={() => setSelectedReview(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><XCircle size={20}/></button>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 italic">"{selectedReview.review_text}"</p>
                </div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Your Official Response</label>
                <textarea 
                  rows="4" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a polite response to the customer..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm resize-none"
                ></textarea>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <button onClick={() => setSelectedReview(null)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">Cancel</button>
                <button onClick={handleReply} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Send Reply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
