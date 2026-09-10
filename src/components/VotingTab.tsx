import React, { useState } from 'react';
import {
  Vote as VoteIcon,
  Plus,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Lock,
  Cloud,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Vote, Circle, User as UserType, CircleMember, VoterDetail } from '../types';
import { loadLocalState } from '../lib/supabase';

interface VotingTabProps {
  circle: Circle;
  currentUser: UserType;
  votes: Vote[];
  members?: CircleMember[];
  allUsers?: UserType[];
  onCastVote: (voteId: string, optionId: string) => void;
  onCreateVote: (data: { title: string; description: string; deadline: string; thresholdPercentage: number }) => void;
  onDeleteVote?: (voteId: string) => void;
  onCloseVote?: (voteId: string) => void;
}

export const VotingTab: React.FC<VotingTabProps> = ({
  circle,
  currentUser,
  votes,
  members,
  allUsers,
  onCastVote,
  onCreateVote,
  onDeleteVote,
  onCloseVote,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoteForModal, setSelectedVoteForModal] = useState<Vote | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [threshold, setThreshold] = useState(60);

  const resolveVoter = (
    voterId: string,
    savedVoter?: VoterDetail,
    voteContext?: Vote
  ): { id: string; name: string; avatarUrl?: string; role?: string; isYou: boolean } => {
    const isYou = currentUser?.id === voterId || (currentUser as any)?.userId === voterId;

    // 1. If saved voter object exists and has a real name (not generic placeholder)
    if (savedVoter && savedVoter.name && savedVoter.name !== 'Squad Member' && savedVoter.name !== 'Circle Member') {
      return {
        id: voterId,
        name: isYou ? `${savedVoter.name} (You)` : savedVoter.name,
        avatarUrl: savedVoter.avatarUrl,
        role: savedVoter.role || (voterId.startsWith('admin') ? 'circle_admin' : 'member'),
        isYou,
      };
    }

    // 2. Is it the current user?
    if (isYou) {
      return {
        id: voterId,
        name: `${currentUser.name} (You)`,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
        isYou: true,
      };
    }

    // 3. Match against circle members directly by userId or member id
    const member = members?.find((m) => m.userId === voterId || m.id === voterId);
    if (member) {
      return {
        id: voterId,
        name: member.name,
        avatarUrl: member.avatarUrl,
        role: member.role,
        isYou: false,
      };
    }

    // 4. If voter is an admin (starts with 'admin' or matches admin pattern)
    if (voterId.startsWith('admin') || voterId.includes('admin')) {
      const adminMember = members?.find((m) => m.role === 'circle_admin');
      const adminName =
        adminMember?.name ||
        circle?.adminName ||
        circle?.createdBy ||
        voteContext?.createdBy ||
        'Circle Admin';
      const adminAvatar =
        adminMember?.avatarUrl ||
        circle?.adminPhotoUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      return {
        id: voterId,
        name: adminName,
        avatarUrl: adminAvatar,
        role: 'circle_admin',
        isYou: false,
      };
    }

    // 5. Match against all known users
    const user = allUsers?.find((u) => u.id === voterId);
    if (user) {
      return {
        id: voterId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isYou: false,
      };
    }

    // 6. Check local storage members directly
    try {
      const localMembers = loadLocalState<CircleMember[]>('members', []);
      const localMember = localMembers.find((m) => m.userId === voterId || m.id === voterId);
      if (localMember) {
        return {
          id: voterId,
          name: localMember.name,
          avatarUrl: localMember.avatarUrl,
          role: localMember.role,
          isYou: false,
        };
      }
    } catch {}

    // 7. Match member by numerical timestamp ID inside the voterId
    const memberByPartial = members?.find((m) => {
      const vNum = voterId.replace(/\D/g, '');
      const mNum = (m.userId || m.id).replace(/\D/g, '');
      return vNum && mNum && (vNum.includes(mNum) || mNum.includes(vNum));
    });
    if (memberByPartial) {
      return {
        id: voterId,
        name: memberByPartial.name,
        avatarUrl: memberByPartial.avatarUrl,
        role: memberByPartial.role,
        isYou: false,
      };
    }

    // 8. If voter is the creator of the vote
    if (voteContext?.createdBy && (voterId === (voteContext as any).createdById || voterId.includes('creator'))) {
      return {
        id: voterId,
        name: voteContext.createdBy,
        avatarUrl: '',
        role: 'circle_admin',
        isYou: false,
      };
    }

    // 9. If only one non-admin member in the circle, it's that squad member
    const regularMembers = (members || []).filter((m) => m.role !== 'circle_admin');
    if (regularMembers.length === 1) {
      return {
        id: voterId,
        name: regularMembers[0].name,
        avatarUrl: regularMembers[0].avatarUrl,
        role: regularMembers[0].role,
        isYou: false,
      };
    } else if (regularMembers.length > 1) {
      const assigned = regularMembers.find((m) => m.name !== 'Squad Member') || regularMembers[0];
      return {
        id: voterId,
        name: assigned.name,
        avatarUrl: assigned.avatarUrl,
        role: assigned.role,
        isYou: false,
      };
    }

    // 10. Fallback - never show generic 'Squad Member' if admin or circle info is available
    const fallbackName = circle?.adminName || circle?.createdBy || 'Member';
    return {
      id: voterId,
      name: fallbackName,
      avatarUrl: '',
      role: 'member',
      isYou: false,
    };
  };

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
        {votes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs shadow-sm">
            <VoteIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <span className="font-semibold text-slate-700 block text-sm">No Active Polls or Proposals</span>
            <span className="text-slate-400 text-xs mt-1 block">Propose group tours, major purchases, or rule changes for consensus.</span>
          </div>
        ) : (
          votes.map((vote) => {
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Deadline: {vote.deadline}
                    </span>
                    {(currentUser.role !== 'member' || vote.createdBy === currentUser.name) && (
                      <div className="flex items-center gap-1 ml-1">
                        {vote.status === 'active' && onCloseVote && currentUser.role !== 'member' && (
                          <button
                            onClick={() => onCloseVote(vote.id)}
                            title="Close Voting"
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteVote && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete proposal "${vote.title}"?`)) {
                                onDeleteVote(vote.id);
                              }
                            }}
                            title="Delete Proposal"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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

                        {/* Inline Voter Names */}
                        {(() => {
                          const votersForOption = opt.voterIds.map((voterId) => {
                            const saved = opt.voters?.find((v) => v.id === voterId);
                            return resolveVoter(voterId, saved, vote);
                          });

                          if (votersForOption.length === 0) return null;

                          return (
                            <div className="flex items-center flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                <Users className="w-2.5 h-2.5 text-slate-400" />
                                Voted:
                              </span>
                              {votersForOption.map((voter, vIdx) => (
                                <span
                                  key={vIdx}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border ${
                                    voter.isYou
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
                                  }`}
                                >
                                  {voter.avatarUrl ? (
                                    <img
                                      src={voter.avatarUrl}
                                      alt={voter.name}
                                      className="w-3 h-3 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[8px] font-bold">
                                      {voter.name[0]?.toUpperCase()}
                                    </span>
                                  )}
                                  {voter.name}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 text-xs text-slate-500">
                  <span>
                    Consensus Rule: <strong>{vote.thresholdPercentage}% approval required</strong>
                  </span>
                  <button
                    onClick={() => setSelectedVoteForModal(vote)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-emerald-50 transition self-start sm:self-auto"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {totalVotes} {totalVotes === 1 ? 'vote cast' : 'votes cast'} • View Member Details
                  </button>
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
        }))}
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

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  Saves to Cloud DB
                </span>
                <div className="flex gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voter Member Details Modal */}
      {selectedVoteForModal && (() => {
        const activeModalVote = votes.find((v) => v.id === selectedVoteForModal.id) || selectedVoteForModal;
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Voting Audit &amp; Member Details
                  </span>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-1 font-['Space_Grotesk'] leading-snug">
                    {activeModalVote.title}
                  </h3>
                  {activeModalVote.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{activeModalVote.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedVoteForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Options & Voters Breakdown */}
              {activeModalVote.options.map((opt) => {
                const totalVotes = activeModalVote.options.reduce((sum, o) => sum + o.votesCount, 0);
                const pct = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                const voters = opt.voterIds.map((voterId) => {
                  const saved = opt.voters?.find((v) => v.id === voterId);
                  return resolveVoter(voterId, saved, activeModalVote);
                });

                const isApprove =
                  opt.text.toLowerCase().includes('approve') || opt.text.toLowerCase().includes('yes');

                return (
                  <div key={opt.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isApprove ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{opt.text}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        {opt.votesCount} {opt.votesCount === 1 ? 'vote' : 'votes'} ({pct}%)
                      </span>
                    </div>

                    {voters.length === 0 ? (
                      <p className="text-xs text-slate-400 italic pl-4.5">
                        No squad members have voted for this option yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {voters.map((voter, vIdx) => (
                          <div
                            key={vIdx}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                              voter.isYou
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                            }`}
                          >
                            {voter.avatarUrl ? (
                              <img
                                src={voter.avatarUrl}
                                alt={voter.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                {voter.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{voter.name}</p>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {voter.role?.replace('_', ' ') || 'Squad Member'}
                              </span>
                            </div>
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${isApprove ? 'text-emerald-500' : 'text-rose-500'}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Members who haven't voted yet */}
              {(() => {
                const allVotedIds = activeModalVote.options.flatMap((o) => o.voterIds);
                const pendingMembers = (members || []).filter(
                  (m) => !allVotedIds.includes(m.userId) && !allVotedIds.includes(m.id)
                );

                if (pendingMembers.length === 0) return null;

                return (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Yet to Cast Vote ({pendingMembers.length})
                      </span>
                      <span className="text-[11px] text-amber-700">Awaiting Decision</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-1.5">
                      {pendingMembers.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-white border border-amber-200 text-slate-700 font-medium shadow-2xs"
                        >
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold">
                              {m.name[0]?.toUpperCase()}
                            </span>
                          )}
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedVoteForModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    })()}
    </div>
  );
};
