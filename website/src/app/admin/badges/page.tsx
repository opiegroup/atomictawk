"use client";

import { useState, useEffect } from "react";
import { Award, Search, User, Trophy, Plus, Check, X, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  category: string;
  auto_award: boolean;
  criteria_type: string;
  criteria_value: number | null;
}

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
}

interface UserBadge {
  badge_id: string;
  slug: string;
  name: string;
  icon: string;
  awarded_at: string;
  reason: string | null;
}

export default function BadgesAdminPage() {
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState<string | null>(null);
  const [awardReason, setAwardReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.display_name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredUsers(users.slice(0, 20));
    }
  }, [searchTerm, users]);

  const loadData = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoading(true);
    try {
      // Load badges
      const { data: badgeData } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      setBadges(badgeData || []);

      // Load users
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("status", "active")
        .order("display_name");

      // Get emails from auth.users if needed
      setUsers(userData || []);
      setFilteredUsers((userData || []).slice(0, 20));
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Load user's badges
    const { data } = await (supabase as any).rpc("get_user_badges", {
      p_user_id: user.id,
    });

    setUserBadges(data || []);
  };

  const awardBadge = async (badgeSlug: string) => {
    if (!selectedUser) return;

    setAwarding(badgeSlug);
    setMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data, error } = await (supabase as any).rpc("award_badge", {
        p_user_id: selectedUser.id,
        p_badge_slug: badgeSlug,
        p_reason: awardReason || null,
      });

      if (error) throw error;

      if (data?.success) {
        setMessage({ type: "success", text: `Awarded "${data.badge_name}" badge!` });
        // Refresh user badges
        selectUser(selectedUser);
      } else {
        setMessage({ type: "error", text: data?.error || "Failed to award badge" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to award badge" });
    } finally {
      setAwarding(null);
      setShowReasonInput(null);
      setAwardReason("");
    }
  };

  const userHasBadge = (badgeSlug: string) => {
    return userBadges.some((b) => b.slug === badgeSlug);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-[#252219] border-b-4 border-[#CCAA4C] px-6 py-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-[#CCAA4C]" />
          <div>
            <h1
              className="text-2xl font-black uppercase tracking-tight"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Honour Badges
            </h1>
            <p className="text-sm text-[#AEACA1]">Award badges to community members</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
          {/* User Selection */}
          <div className="bg-[#252219] border-2 border-[#353535] rounded p-4">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Select Member
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
              />
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#CCAA4C]" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-[#666] py-4">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded text-left transition-colors ${
                      selectedUser?.id === user.id
                        ? "bg-[#CCAA4C]/20 border border-[#CCAA4C]"
                        : "bg-[#1a1a1a] hover:bg-[#353535] border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#353535] flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#CCAA4C] font-bold">
                          {user.display_name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">
                        {user.display_name || "Anonymous"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Badge Award Panel */}
          <div className="bg-[#252219] border-2 border-[#353535] rounded p-4">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-[#666]">
                <Trophy className="w-16 h-16 mb-4 opacity-30" />
                <p>Select a member to award badges</p>
              </div>
            ) : (
              <>
                {/* Selected User Header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#353535]">
                  <div className="w-16 h-16 rounded-full bg-[#353535] flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#CCAA4C] text-2xl font-bold">
                        {selectedUser.display_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedUser.display_name || "Anonymous"}
                    </h3>
                    <p className="text-sm text-[#AEACA1]">
                      {userBadges.length} badge{userBadges.length !== 1 ? "s" : ""} earned
                    </p>
                  </div>
                </div>

                {/* Current Badges */}
                {userBadges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCAA4C] mb-3">
                      Current Badges
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userBadges.map((badge) => (
                        <div
                          key={badge.badge_id}
                          className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#353535] rounded"
                          title={badge.reason || badge.name}
                        >
                          <span>{badge.icon}</span>
                          <span className="text-sm text-white">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {message && (
                  <div
                    className={`mb-4 p-3 rounded text-sm ${
                      message.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Available Badges */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCAA4C] mb-3">
                  Award Badge
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {badges.map((badge) => {
                    const hasIt = userHasBadge(badge.slug);
                    const isAwarding = awarding === badge.slug;
                    const showReason = showReasonInput === badge.slug;

                    return (
                      <div
                        key={badge.id}
                        className={`p-3 border rounded transition-all ${
                          hasIt
                            ? "bg-[#1a1a1a] border-green-500/30 opacity-60"
                            : "bg-[#1a1a1a] border-[#353535] hover:border-[#CCAA4C]/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-sm">{badge.name}</h5>
                              {hasIt && <Check className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-xs text-[#AEACA1] line-clamp-2 mt-1">
                              {badge.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[10px] uppercase tracking-wider ${
                                  badge.tier === "legendary"
                                    ? "text-[#CCAA4C]"
                                    : badge.tier === "gold"
                                    ? "text-yellow-400"
                                    : badge.tier === "platinum"
                                    ? "text-slate-300"
                                    : badge.tier === "special"
                                    ? "text-purple-400"
                                    : "text-[#666]"
                                }`}
                              >
                                {badge.tier}
                              </span>
                              {badge.auto_award && (
                                <span className="text-[10px] text-[#666]">• Auto-awarded</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Award Button / Reason Input */}
                        {!hasIt && (
                          <div className="mt-3">
                            {showReason ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={awardReason}
                                  onChange={(e) => setAwardReason(e.target.value)}
                                  placeholder="Reason (optional)"
                                  className="w-full px-3 py-1 bg-[#252219] border border-[#353535] rounded text-white text-xs focus:border-[#CCAA4C] focus:outline-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => awardBadge(badge.slug)}
                                    disabled={isAwarding}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-[#CCAA4C] text-[#1a1a1a] font-bold text-xs uppercase rounded disabled:opacity-50"
                                  >
                                    {isAwarding ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Award className="w-3 h-3" />
                                        Award
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowReasonInput(null);
                                      setAwardReason("");
                                    }}
                                    className="px-3 py-1 bg-[#353535] text-white text-xs rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowReasonInput(badge.slug)}
                                className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-[#353535] hover:bg-[#454545] text-white text-xs uppercase rounded"
                              >
                                <Plus className="w-3 h-3" />
                                Award Badge
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
