import LoginForm from "@/components/LoginForm";
import { signIn, signUp, signInWithGitHub, signInWithGoogle } from "@/app/actions/auth";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <LoginForm 
      signIn={signIn}
      signUp={signUp}
      signInWithGitHub={signInWithGitHub}
      signInWithGoogle={signInWithGoogle}
      searchParams={searchParams}
    />
  );
}