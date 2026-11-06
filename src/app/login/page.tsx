import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Image
          src="/logo_tenda.webp"
          alt="Comunidade Tenda"
          width={96}
          height={96}
          priority
          className="rounded-2xl bg-primary p-2"
        />
        <LoginForm />
      </div>
    </main>
  );
}
