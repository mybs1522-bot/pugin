import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTransferToken } from "@/lib/device-auth";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Props {
  searchParams: Promise<{ state?: string }>;
}

export default async function DesktopReturnPage({ searchParams }: Props) {
  const { state } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !state) redirect("/auth/signin");

  const transferToken = await createTransferToken(state, {
    id: (session.user as { id?: string }).id,
    email: session.user?.email,
    name: session.user?.name,
    image: session.user?.image,
  });

  if (!transferToken) redirect("/auth/signin?error=expired");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Login complete!</h1>
          <p className="text-muted-foreground text-sm">
            You can close this browser tab and return to SketchUp.
          </p>
        </div>

        <div className="bg-background space-y-1 rounded-xl border p-4 text-left">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Signed in as
          </p>
          <p className="font-medium">{session.user?.name}</p>
          <p className="text-muted-foreground text-sm">{session.user?.email}</p>
        </div>

        <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
          <Image
            src="/v6-logo.png"
            alt="V6 Render"
            width={24}
            height={16}
            className="h-4 w-auto object-contain"
          />
          V6 Render — switch back to SketchUp
        </div>
      </div>
    </div>
  );
}
