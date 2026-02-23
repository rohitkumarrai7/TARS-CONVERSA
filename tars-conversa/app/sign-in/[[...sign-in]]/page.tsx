import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-indigo-950 via-zinc-900 to-zinc-950 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">TC</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            Tars-Conversa
          </h1>
          <p className="text-indigo-300 text-sm">
            Conversations that connect.
          </p>
        </div>
      </div>

      <SignIn />
    </div>
  );
}
