import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, X, Send, Bot, User as UserIcon, Sparkles,
  ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight,
  Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { askSentinel, ChatContext, ChatResponse } from '../../services/geminiService';

interface SentinelChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SentinelChatbot: React.FC<SentinelChatbotProps> = ({ isOpen, onToggle }) => {
  const { currentUser, currentCompany, allUsers } = useAuth();
  const {
    reports, blocklist, alerts, loginAttempts, federatedRounds,
    chatHistory, saveChatMessage, clearChatHistory, dispatchHeadAlert
  } = useData();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingActionModal, setPendingActionModal] = useState<{
    show: boolean;
    proposal: any;
  }>({ show: false, proposal: null });
  const [alertSuccessToast, setAlertSuccessToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scoped company data
  const companyReports = reports.filter(r => r.company_id === currentCompany?.id);
  const companyBlocklist = blocklist.filter(b => b.company_id === currentCompany?.id);
  const companyAlerts = alerts.filter(a => a.company_id === currentCompany?.id);
  const companyUsers = allUsers.filter(u => u.company_id === currentCompany?.id);
  const companyAttempts = loginAttempts.filter(l => l.company_id === currentCompany?.id);

  const restrictedUsers = companyUsers
    .filter(u => u.status === 'restricted' || u.failed_attempt_count >= 3)
    .map(u => ({
      name: u.full_name,
      email: u.email,
      code: u.employee_code,
      attempts: u.failed_attempt_count || 3,
    }));

  const globalFedAccuracy = federatedRounds.length > 0
    ? federatedRounds[federatedRounds.length - 1].global_accuracy
    : 91;

  // Build authorized company context
  const chatContext: ChatContext = {
    companyId: currentCompany?.id || 'comp-novapay',
    companyName: currentCompany?.name || 'NovaPay',
    userRole: currentUser?.role || 'analyst',
    userName: currentUser?.full_name || 'Staff',
    totalReports: companyReports.length,
    pendingReports: companyReports.filter(r => r.status === 'pending' || r.status === 'under_review').length,
    confirmedThreats: companyReports.filter(r => r.status === 'confirmed' || r.status === 'blocked').length,
    blockedUrlsCount: companyBlocklist.length,
    blockedUrls: companyBlocklist.map(b => b.indicator_value),
    failedLoginAttemptsCount: companyAttempts.filter(a => a.status === 'failed').length,
    restrictedAccountsCount: restrictedUsers.length,
    restrictedUsers,
    recentAlerts: companyAlerts.slice(0, 4).map(a => ({ id: a.id, title: a.title, severity: a.severity, created_at: a.created_at })),
    recentReports: companyReports.slice(0, 4).map(r => ({ id: r.id, indicator: r.indicator_value, score: r.risk_score, status: r.status, category: r.threat_category })),
    federatedLearningAccuracy: globalFedAccuracy,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, chatHistory, isTyping]);

  useEffect(() => {
    if (chatHistory.length === 0 && currentUser && currentCompany) {
      saveChatMessage({
        company_id: currentCompany.id,
        user_id: currentUser.id,
        role: 'assistant',
        message: `Welcome to TrustLens Sentinel, your 24/7 AI Security Assistant for ${currentCompany.name}.\n\nI have authorized access to your organization's threat telemetry, blocked URLs, and login monitoring logs. Ask me any security question or request an action.`,
        recommended_action: 'Type any question or click a quick prompt below.',
      });
    }
  }, [currentCompany, currentUser, chatHistory.length]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || isTyping || !currentUser || !currentCompany) return;

    setInputMessage('');

    saveChatMessage({
      company_id: currentCompany.id,
      user_id: currentUser.id,
      role: 'user',
      message: text,
    });

    setIsTyping(true);

    try {
      const historyPayload = chatHistory.slice(-8).map(m => ({
        role: m.role,
        message: m.message,
      }));

      const res: ChatResponse = await askSentinel(text, historyPayload, chatContext);

      saveChatMessage({
        company_id: currentCompany.id,
        user_id: currentUser.id,
        role: 'assistant',
        message: res.message,
        sources: res.sources,
        recommended_action: res.recommended_action,
        action_proposal: res.action_proposal,
      });

      if (res.action_proposal) {
        setPendingActionModal({
          show: true,
          proposal: res.action_proposal,
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      saveChatMessage({
        company_id: currentCompany.id,
        user_id: currentUser.id,
        role: 'assistant',
        message: 'I apologize, an error occurred while processing your request. Please try again.',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingActionModal.proposal) return;
    const { title, payload } = pendingActionModal.proposal;

    try {
      const alertMsg = `🚨 TrustLens Security Alert — ${payload?.companyName || currentCompany?.name}\n\nRepeated failed login attempts detected across restricted accounts.\n\nAccounts Flagged:\n${(payload?.restrictedUsers || []).map((u: any) => `• ${u.name} (${u.email})`).join('\n') || '• Rahul Sharma (rahul.sharma@novapay.com)'}\n\nAction: High-priority advisory dispatched via TrustLens Sentinel.\nStatus: Delivered to Security Head.`;

      const newAlert = await dispatchHeadAlert(
        title || 'Security Head Alert Dispatched via Sentinel',
        alertMsg,
        {
          dispatched_by: currentUser?.full_name,
          employee_count: payload?.restrictedUsers?.length || 2,
        }
      );

      setPendingActionModal({ show: false, proposal: null });
      setAlertSuccessToast(`Alert ${newAlert.id} dispatched to ${currentCompany?.name} Head!`);
      setTimeout(() => setAlertSuccessToast(null), 4000);

      saveChatMessage({
        company_id: currentCompany!.id,
        user_id: currentUser!.id,
        role: 'assistant',
        message: `✅ Security Alert [${newAlert.id}] has been officially dispatched to ${currentCompany?.name}'s Security Head and recorded in the audit log.\n\nThe alert is now marked as OPEN in the Security Alert Center.`,
        sources: ['Security Alert Bus', 'Audit Trail'],
        recommended_action: 'Monitor the Security Dashboard for company head acknowledgment.',
      });
    } catch (e) {
      console.error('Failed to dispatch alert:', e);
    }
  };

  const quickChips = [
    { label: "Today's threats", query: "Show today's high-risk threats." },
    { label: "Failed logins", query: "Which employees have failed login attempts?" },
    { label: "Blocked URLs", query: "Which URLs are blocked?" },
    { label: "Why novapay blocked", query: "Why was novapay-secure-login.com blocked?" },
    { label: "Company summary", query: "Give me a security summary." },
    { label: "Send alert", query: `Alert ${currentCompany?.name}'s head about repeated failed logins.` },
    { label: "What is phishing?", query: "What is phishing?" },
    { label: "What is a passkey?", query: "What is a passkey?" },
    { label: "Homoglyph attack", query: "What is a homoglyph attack?" },
  ];

  return (
    <>
      {/* Floating Action Trigger Button - Blue & White Combo */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-2xl shadow-blue-700/35 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border border-blue-300/40 cursor-pointer"
          aria-label="Open 24/7 AI Security Assistant"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">TrustLens Sentinel</span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse ring-2 ring-white/40" />
        </button>
      )}

      {/* Floating Chat Panel - Blue & White Combo */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 bg-white border-2 border-blue-200/90 shadow-2xl shadow-blue-900/20 rounded-2xl flex flex-col overflow-hidden ring-1 ring-blue-500/10 ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-6 right-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header - Royal Blue & White */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-blue-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner backdrop-blur-xs">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white tracking-tight">TrustLens Sentinel</span>
                  <span className="text-[10px] bg-white/20 text-white font-bold font-mono px-2 py-0.5 rounded-full backdrop-blur-xs">
                    24/7 ONLINE
                  </span>
                </div>
                <div className="text-[11px] text-blue-100">
                  {currentCompany?.name} Security Context · {currentUser?.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChatHistory}
                title="Clear chat history"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Expand'}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onToggle}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert Success Banner */}
          {alertSuccessToast && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-[11px] text-blue-900 flex items-center gap-2 shrink-0 animate-fadeIn font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{alertSuccessToast}</span>
            </div>
          )}

          {/* Quick-action Chips Bar - Blue & White */}
          <div className="px-3 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Message List - Blue & White Theme */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/20 via-white to-blue-50/30">
            {chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-xs shadow-md shadow-blue-600/20'
                      : 'bg-white text-slate-900 border-2 border-blue-100 rounded-tl-xs shadow-sm shadow-blue-900/5'
                  }`}>
                    <div className="whitespace-pre-line font-normal">
                      {msg.message}
                    </div>

                    {/* Sources Badge */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-blue-100 text-[10px] text-blue-700">
                        <span className="font-bold text-blue-900">Sources: </span>
                        <span>{msg.sources.join(' · ')}</span>
                      </div>
                    )}

                    {/* Recommended Action Box */}
                    {msg.recommended_action && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 text-[11px] text-blue-950 flex items-start gap-2 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-blue-900">Recommended Action: </strong>
                          <span>{msg.recommended_action}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Proposal Button */}
                    {msg.action_proposal && (
                      <div className="mt-3 pt-2 border-t border-blue-100">
                        <button
                          onClick={() => setPendingActionModal({ show: true, proposal: msg.action_proposal })}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Dispatch Alert to {currentCompany?.name} Head</span>
                        </button>
                      </div>
                    )}

                    <div className={`text-[9px] mt-1.5 text-right font-mono ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 shadow-2xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border-2 border-blue-100 rounded-2xl px-4 py-2.5 text-xs text-blue-700 flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-blue-700 font-medium ml-1">Sentinel is reasoning...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Dock - Blue & White */}
          <div className="p-3 bg-white border-t border-blue-100 shrink-0 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Sentinel anything about threats, logins, phishing, or alerts..."
                className="flex-1 bg-blue-50/30 border border-blue-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md shadow-blue-600/25"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-blue-700/80 text-center mt-2 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-tenant data isolated to {currentCompany?.name}. Never discloses credentials or raw biometric records.</span>
            </div>
          </div>
        </div>
      )}

      {/* Alert Confirmation Modal */}
      {pendingActionModal.show && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Confirm High-Priority Security Alert
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {pendingActionModal.proposal?.details}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-5 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Target Entity:</span>
                <span className="text-slate-900 font-semibold">{currentCompany?.name} Security Head</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Priority Level:</span>
                <span className="text-rose-600 font-bold uppercase">CRITICAL</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Restricted Accounts:</span>
                <span className="text-slate-900 font-mono font-medium">{restrictedUsers.length || 2} Employees</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPendingActionModal({ show: false, proposal: null })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
