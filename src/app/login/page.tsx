import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="tenda-pattern flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        {/* O logo é branco, feito para o fundo marrom. */}
        <Image src="/logo_tenda.webp" alt="" width={112} height={110} priority />
        <div className="text-center text-primary-foreground">
          <h1 className="text-3xl font-bold">Comunidade Tenda</h1>
          <p className="mt-1 text-sm text-primary-foreground/75">Secretaria dos acampamentos</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
