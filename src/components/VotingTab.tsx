import React, { useState } from 'react';
import { Vote as VoteIcon, Plus, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Vote, Circle, User as UserType } from '../types';

interface VotingTabProps {
  circle: Circle;
  currentUser: UserType;
  votes: Vote[];
  onCastVote: (voteId: string, optionId: string) => void;
  onCreateVote: (data: { title: string; description: string; deadline: string; thresholdPercentage: number }) => void;
}

export const VotingTab: React.FC<VotingTabProps> = ({
  circle,
  currentUser,
  votes,
  onCastVote,
  onCreateVote,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [threshold, setThreshold] = useState(60);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onCreateVote({
      title,
      description,
      deadline: deadline || '2026-11-30',
      thresholdPercentage: threshold,
    });
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Consensus &amp; Group Decision Polls
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Democratic decision-making for large expenses, tour bookings, and member admissions.
          </p>
        </div>

        <button
          id="voting-create-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Create New Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {votes.map((vote) => {
          const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votesCount, 0);
          const approveOpt = vote.options[0];
          const rejectOpt = vote.options[1];

          return (
            <div
              key={vote.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      vote.status === 'closed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {vote.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Deadline: {vote.deadline}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-3 font-['Space_Grotesk'] leading-snug">
                  {vote.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{vote.description}</p>

                {/* Vote Progress Options */}
                <div className="mt-5 space-y-3">
                  {vote.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                    const isMyVote = opt.voterIds.includes(currentUser.id);

                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1.5 text-slate-800">
                            {opt.text}
                            {isMyVote && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                                Your Vote
                              </span>
                            )}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {opt.votesCount} votes ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              opt.text.toLowerCase().includes('approve') || opt.text.toLowerCase().includes('yes')
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                  <span>
                    Consensus Rule: <strong>{vote.thresholdPercentage}% approval required</strong>
                  </span>
                  <span>{totalVotes} votes cast</span>
                </div>

                {vote.status === 'active' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {approveOpt && (
                      <button
                        onClick={() => onCastVote(vote.id, approveOpt.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          approveOpt.voterIds.includes(currentUser.id)
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {approveOpt.text}
                      </button>
                    )}
                    {rejectOpt && (
                      <button
                        onClick={() => onCastVote(vote.id, rejectOpt.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          rejectOpt.voterIds.includes(currentUser.id)
                            ? 'bg-rose-600 text-white shadow'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        {rejectOpt.text}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-1.5 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-800">
                    {vote.result || 'Proposal Approved by Squad'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Proposal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Group Decision Vote</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Proposal Question</label>
                <input
                  type="text"
                  placeholder="e.g. Should we book the beach villa for ₹25,000?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Proposal Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe details, dates, advance requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Voting Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pass Threshold (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Publish Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
