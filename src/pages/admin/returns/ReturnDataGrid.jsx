import React from 'react';
import { Search, Filter, Download, MoreHorizontal, Eye, RefreshCw, XCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReturnDataGrid({ requests, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Return Requested':
      case 'Return Under Review':
      case 'Refund Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Return Approved':
      case 'Refunded':
      case 'Replacement Sent':
      case 'Exchanged':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Return Rejected':
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <div className="w-full overflow-x-auto">
<table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Product Info</th>
              <th className="px-6 py-4 font-semibold">Reason</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requests.map((request, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={request.id} 
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => onViewDetails(request)}
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                    #{request.order_id ? request.order_id.slice(-8).toUpperCase() : 'N/A'}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(request.requested_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800 truncate max-w-[150px]">
                    {request.customer_id?.slice(0, 10)}...
                  </div>
                  <div className="text-xs text-slate-500 capitalize">{request.payment_mode}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {request.items?.[0]?.image_url ? (
                        <img src={request.items[0].image_url} alt="product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-[150px]">
                        {request.items?.[0]?.title || 'Multiple Items'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Qty: {request.items?.reduce((acc, item) => acc + item.quantity, 0) || 1}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {request.reason}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">₹{request.total_amount?.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onViewDetails(request)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <RotateCcw className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-700">No return requests found</p>
                    <p className="text-sm">There are currently no active return or refund requests.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
</div>
      </div>
      
      {/* Pagination Footer */}
      {requests.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-800">1</span> to <span className="font-medium text-slate-800">{requests.length}</span> of <span className="font-medium text-slate-800">{requests.length}</span> results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 bg-white" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 bg-white" disabled>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
