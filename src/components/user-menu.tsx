import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";

export async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{user.name}</span>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>
    </div>
  );
}
