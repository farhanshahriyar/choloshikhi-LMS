import { LayoutDashboard, Compass, BookOpen, BarChart3, Users, MessageSquarePlus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/browse", label: "Browse", icon: Compass },
];

const teacherLinks = [
  { to: "/teacher/courses", label: "Courses", icon: BookOpen },
  { to: "/teacher/enrollments", label: "Students", icon: Users },
  { to: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { mode } = useMode();
  const { user } = useAuth();
  const links = mode === "teacher" ? teacherLinks : studentLinks;

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast.error("Please enter your feedback before sending.");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user!.id,
        category: feedbackType,
        message: feedbackMessage,
        user_email: user?.email ?? null,
      });

      if (error) throw error;

      toast.success("Thank you! Your feedback has been sent.");
      setFeedbackMessage("");
      setFeedbackType("general");
      setFeedbackOpen(false);
    } catch {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`${collapsed ? 'p-2 flex justify-center' : 'p-4'}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-sm font-bold">C</span>
          </div>
          {!collapsed && <span className="font-semibold text-foreground text-lg">CholoShikhi</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={to}
                      end
                      className={`hover:bg-primary/20 hover:text-black transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
                      activeClassName="bg-primary/80 text-primary-foreground font-medium"
                    >
                      <Icon className={`${collapsed ? '' : 'mr-2'} h-5 w-5 `} />
                      {!collapsed && <span>{label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setFeedbackOpen(true)}
              tooltip="Send Feedback"
              className={`hover:bg-primary/20 hover:text-black transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <MessageSquarePlus className={`${collapsed ? '' : 'mr-2'} h-5 w-5 `} />
              {!collapsed && <span>Send Feedback</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              We'd love to hear from you. Share your thoughts, report a bug, or suggest an improvement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your Feedback</Label>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendFeedback} disabled={sending}>
              {sending ? "Sending..." : "Send Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default AppSidebar;
