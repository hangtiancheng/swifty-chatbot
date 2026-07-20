import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import type { Session } from "@/types";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  sessions: Session[];
  currentSessionId: string | null;
  onCreateNewSession: () => void;
  onSwitch: (sessionId: string) => void;
}

function SessionSidebar({
  sessions,
  currentSessionId,
  onCreateNewSession,
  onSwitch,
}: Props) {
  const { t } = useTranslation();

  return (
    <aside className="bg-background flex w-72 flex-col border-r">
      <div className="border-b p-4">
        <Button
          variant="outline"
          onClick={onCreateNewSession}
          className="press-feedback h-10 w-full rounded-full shadow-sm"
        >
          <Plus data-icon="inline-start" className="text-primary" />
          {t("chat.new_chat")}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSwitch(session.id)}
              className={cn(
                "mb-1 w-full rounded-full px-4 py-3 text-left text-sm transition-colors",
                currentSessionId === session.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent",
              )}
            >
              {session.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default SessionSidebar;
