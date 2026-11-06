import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";

export async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex shrink-0 items-center gap-3 text-sm">
      <span className="hidden text-muted-foreground md:inline">{user.name}</span>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>
    </div>
  );
}
