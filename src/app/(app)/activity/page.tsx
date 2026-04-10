import { MOCK_ACTIVITY } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckSquare, FolderOpen, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity – TaskMatrix" };

const typeIcons = {
  task: CheckSquare,
  comment: MessageSquare,
  project: FolderOpen,
  member: Users,
};
const typeColors = {
  task: "text-violet-500",
  comment: "text-blue-500",
  project: "text-emerald-500",
  member: "text-amber-500",
};

export default function ActivityPage() {
  return (
    <div className="space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold">Activity Feed</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All workspace events</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_ACTIVITY.map((item) => {
              const Icon = typeIcons[item.type];
              const iconColor = typeColors[item.type];
              return (
                <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                  <div className={`mt-0.5 p-1.5 rounded-lg bg-muted ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-primary">
                      {item.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">{item.user.name}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] capitalize h-4 px-1.5 py-0">
                        {item.type}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
