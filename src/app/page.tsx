import { BuilderWorkspace } from "@/components/builder/BuilderWorkspace";
import { AuthGate } from "@/components/auth/AuthGate";

export default function Home() {
  return (
    <AuthGate>
      <BuilderWorkspace />
    </AuthGate>
  );
}
