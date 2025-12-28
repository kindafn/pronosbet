import { supabase } from "@/integrations/supabase/client";

export async function getUserRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Erreur récupération rôle:", error.message);
    return null;
  }

  return data?.role;
}

