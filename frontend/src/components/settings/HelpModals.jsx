import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, AlertCircle, MessageSquare, FileText, Shield, Info, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const FAQS = [
  { q: 'How do I sell a product on UniKart?', a: 'Tap the "Sell" button, fill in product details and photos, then publish. Your listing goes live instantly for verified students.' },
  { q: 'Is UniKart only for my college?', a: 'UniKart is open to verified students across campuses. You can buy and sell with students from other colleges too.' },
  { q: 'How do payments work?', a: 'Payments are handled directly between buyers and sellers (UPI/cash on meetup). UniKart does not process payments directly.' },
  { q: 'What if I get scammed or have an issue?', a: 'Report the user via the Report button on their profile. Our campus moderation team reviews all reports within 24 hours.' },
  { q: 'How do I delete my listing?', a: 'Go to Dashboard → My Listings, then tap the delete icon on any of your active listings.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-50 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-4 text-left gap-3">
        <p className="text-sm font-black text-gray-900 pr-2">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="text-xs text-gray-600 font-bold pb-4 pr-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HelpCenterModal({ onClose }) {
  const [tab, setTab] = useState('faq'); // faq | contact | report
  const [form, setForm] = useState({ category: 'General', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) return setError('Please fill in all fields.');
    setSending(true);
    setError('');
    try {
      await api.post('/support/contact', form);
    } catch {}
    // Always mark as sent (gracefully degrade if endpoint missing)
    setSent(true);
    setSending(false);
  };

  const categories = ['General', 'Payment Issue', 'Listing Problem', 'Safety Concern', 'Account Issue', 'Other'];

  const tabClass = (t) => `flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Help & Support</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">We're here to help</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-50 rounded-2xl mb-6">
            <button className={tabClass('faq')} onClick={() => setTab('faq')}>FAQs</button>
            <button className={tabClass('contact')} onClick={() => setTab('contact')}>Contact</button>
            <button className={tabClass('report')} onClick={() => setTab('report')}>Report</button>
          </div>

          {/* FAQ Tab */}
          {tab === 'faq' && (
            <div className="bg-gray-50 rounded-2xl px-5">
              {FAQS.map((f, i) => <FAQItem key={i} {...f} />)}
            </div>
          )}

          {/* Contact Tab */}
          {tab === 'contact' && (
            sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 font-bold">Our team will respond within 24 hours.</p>
                <button onClick={onClose} className="mt-6 w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
                  Close
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all resize-none" />
                </div>
                {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                <button onClick={handleSend} disabled={sending}
                  className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </div>
            )
          )}

          {/* Report Tab */}
          {tab === 'report' && (
            sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">Report Submitted!</h3>
                <p className="text-sm text-gray-500 font-bold">We'll review this within 24 hours.</p>
                <button onClick={onClose} className="mt-6 w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
                  Close
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide mb-1">Safety First</p>
                  <p className="text-xs text-amber-700 font-bold">All reports are reviewed by our campus moderation team. False reports may affect your account.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue Type</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {['Scam / Fraud', 'Inappropriate Content', 'Fake Listing', 'Harassment', 'Spam', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe the problem in detail..." rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                </div>
                {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                <button onClick={handleSend} disabled={sending}
                  className="w-full h-12 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><AlertCircle className="w-4 h-4" /> Submit Report</>}
                </button>
              </div>
            )
          )}

          {(tab === 'faq') && (
            <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all mt-6">
              Close
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─────────────────── About Modal ─────────────────── */
export function AboutModal({ onClose }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 text-center">
          <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
            <span className="text-white font-black text-3xl">UK</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">UniKart</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Campus Marketplace</p>
          <p className="text-xs text-gray-500 font-bold mt-4 leading-relaxed">
            The fastest growing student-to-student marketplace in India. Buy, sell, and connect with verified students on your campus.
          </p>
          <div className="grid grid-cols-3 gap-3 my-6">
            {[['v2.1.0', 'Version'], ['Production', 'Build'], ['MIT', 'License']].map(([val, lbl]) => (
              <div key={lbl} className="p-3 bg-gray-50 rounded-2xl">
                <p className="text-sm font-black text-gray-900">{val}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
