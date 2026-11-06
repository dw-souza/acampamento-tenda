import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";

export async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex shrink-0 items-center gap-2 text-sm">
      <span className="hidden text-primary-foreground/80 2xl:inline">{user.name}</span>
      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut /> Sair
        </Button>
      </form>
    </div>
  );
}
