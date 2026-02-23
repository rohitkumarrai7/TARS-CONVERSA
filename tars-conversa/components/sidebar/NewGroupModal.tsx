"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/shared/UserAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserClerkId: string;
}

export default function NewGroupModal({
  isOpen,
  onClose,
  currentUserClerkId,
}: NewGroupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<
    Array<{ clerkId: string; name: string; imageUrl: string }>
  >([]);
  const [groupName, setGroupName] = useState("");
  const [groupImageUrl, setGroupImageUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const users = useQuery(api.users.searchUsers, {
    searchQuery,
    currentUserClerkId,
  });

  const createGroup = useMutation(api.conversations.createGroupConversation);

  const toggleUser = (user: {
    clerkId: string;
    name: string;
    imageUrl: string;
  }) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.clerkId === user.clerkId);
      if (exists) {
        return prev.filter((u) => u.clerkId !== user.clerkId);
      }
      return [...prev, user];
    });
  };

  const resetState = () => {
    setStep(1);
    setSearchQuery("");
    setSelectedUsers([]);
    setGroupName("");
    setGroupImageUrl("");
  };

  const handleCreate = async () => {
    if (groupName.trim() === "") {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      toast.error("Select at least 2 members");
      return;
    }
    try {
      setIsCreating(true);
      const conversationId = await createGroup({
        creatorClerkId: currentUserClerkId,
        memberClerkIds: selectedUsers.map((u) => u.clerkId),
        groupName: groupName.trim(),
        groupImageUrl: groupImageUrl || undefined,
      });
      router.push(`/chat/${conversationId}`);
      onClose();
      resetState();
    } catch {
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetState();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base font-semibold">
            {step === 1
              ? "New Group — Select Members"
              : "New Group — Details"}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: User Selection */}
        {step === 1 && (
          <>
            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b">
                {selectedUsers.map((user) => (
                  <span
                    key={user.clerkId}
                    className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full"
                  >
                    {user.name}
                    <button
                      onClick={() => toggleUser(user)}
                      className="hover:text-indigo-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-0"
                />
              </div>
            </div>

            {/* User list */}
            <div className="max-h-64 overflow-y-auto chat-scroll p-2 space-y-0.5">
              {users?.map((user) => {
                const isSelected = selectedUsers.some(
                  (u) => u.clerkId === user.clerkId
                );
                return (
                  <button
                    key={user.clerkId}
                    onClick={() => toggleUser(user)}
                    className={cn(
                      "w-full flex items-center gap-3",
                      "px-3 py-2.5 rounded-lg transition-colors",
                      "text-left",
                      isSelected ? "bg-indigo-500/10" : "hover:bg-muted/60"
                    )}
                  >
                    <div className="relative">
                      <UserAvatar
                        imageUrl={user.imageUrl}
                        name={user.name}
                        size="sm"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedUsers.length} selected (min. 2 required)
              </span>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedUsers.length < 2}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                size="sm"
              >
                Next →
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: Group Details */}
        {step === 2 && (
          <>
            <div className="px-4 py-4 space-y-4">
              {/* Preview of selected members */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedUsers.length} members selected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUsers.map((u) => (
                    <span
                      key={u.clerkId}
                      className="text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {u.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Group name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Group Name *</label>
                <Input
                  autoFocus
                  placeholder="e.g. Team Chat"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-muted/50"
                />
              </div>

              {/* Group image URL (optional) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Group Image URL
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <Input
                  placeholder="https://..."
                  value={groupImageUrl}
                  onChange={(e) => setGroupImageUrl(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || groupName.trim() === ""}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                size="sm"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
