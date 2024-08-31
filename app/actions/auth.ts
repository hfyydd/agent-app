"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/");
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (authError) {
    return redirect("/login?message=Could not authenticate user");
  }

  if (authData.user) {
    // 插入 accounts 和 profiles 记录的逻辑
    // ... (保持原有的插入逻辑不变)
  }

  return redirect("/login?message=Check email to continue sign in process");
}

export async function signInWithGitHub() {
  // ... (保持原有的 GitHub 登录逻辑不变)
}

export async function signInWithGoogle() {
  // ... (保持原有的 Google 登录逻辑不变)
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}