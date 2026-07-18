import { KeyRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProfileForm } from "./profile-form";

// Static design only — replace with a real session/DB lookup once auth is wired.
async function getProfile() {
  return {
    name: "Liu Yu-Chen",
    studentId: "s10712345",
    major: "International Business",
    email: "s10712345@thu.edu.tw",
    role: "Student",
    memberSince: "February 2026",
    lastLogin: "today 09:15",
  };
}

export default async function ProfilePage() {
  const profile = await getProfile();
  const initials = profile.name
    .split(/\s|-/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
            <Badge variant="secondary">{profile.role}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Member since {profile.memberSince} · Last login {profile.lastLogin}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ProfileForm
          profile={{
            name: profile.name,
            studentId: profile.studentId,
            major: profile.major,
            email: profile.email,
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="email-notify" className="text-sm">
                  Email me new announcements
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get an email when the OIR publishes a new announcement.
                </p>
              </div>
              <Switch id="email-notify" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="save-history" className="text-sm">
                  Save my chat history
                </Label>
                <p className="text-xs text-muted-foreground">
                  Keep AI assistant conversations linked to your account.
                </p>
              </div>
              <Switch id="save-history" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>
              Change your password regularly to keep your account safe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              <KeyRound className="size-4" />
              Change password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
