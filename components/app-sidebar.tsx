"use client";

import {
  Home,
  Wand2,
  Palette,
  HelpCircle,
  LogIn,
  LogOut,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useSubscription } from "@/hooks/use-subscription";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", icon: Home, href: "/" },
  { title: "Studio", icon: Wand2, href: "/render" },
  { title: "Help", icon: HelpCircle, href: "/help" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    subscribed,
    status: subStatus,
    generationCount,
    generationLimit,
    cancelAtPeriodEnd,
    loading: subLoading,
  } = useSubscription();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isTrialing = subStatus === "trialing";
  const onFreeTrial = isLoggedIn && !subscribed && !subLoading;
  const trialExhausted = onFreeTrial && generationCount >= generationLimit;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <Image
                  src="/v6-logo.png"
                  alt="V6 Render"
                  width={32}
                  height={22}
                  className="h-7 w-auto shrink-0 object-contain"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-extrabold tracking-tight">
                    V6 Render
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                    SketchUp Studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => !(item.href === "/" && isLoggedIn))
                .map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        {cancelAtPeriodEnd && (
          <div className="px-2 pb-1">
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              Subscription cancelled
            </div>
          </div>
        )}
        {onFreeTrial && !cancelAtPeriodEnd && (
          <div className="px-2 pb-1">
            {trialExhausted ? (
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                <Zap className="h-3 w-3 fill-current" />
                Trial limit reached
              </div>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400">
                    <Zap className="h-3 w-3" />
                    Free renders
                  </span>
                  <span className="text-foreground text-xs font-semibold">
                    {generationLimit - generationCount} left
                  </span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{
                      width: `${Math.min((generationCount / generationLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
        <SidebarMenu>
          {status === "authenticated" && session?.user ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  tooltip={session.user.name ?? "Account"}
                >
                  <Link href="/settings">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                      <span className="truncate text-sm font-medium">
                        {session.user.name}
                      </span>
                      {onFreeTrial ? (
                        <span
                          className={`truncate text-xs font-medium ${trialExhausted ? "text-destructive" : "text-amber-500 dark:text-amber-400"}`}
                        >
                          {trialExhausted
                            ? "Trial limit reached"
                            : `${generationLimit - generationCount} of ${generationLimit} renders left`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground truncate text-xs">
                          {session.user.email}
                        </span>
                      )}
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sign out" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign in"
                onClick={() => router.push("/auth/signin")}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
