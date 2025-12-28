import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // clé avec droits admin
);

export default async function handler(req: Request) {
  // Appelle ta fonction SQL pour nettoyer les anciens messages
  const { error } = await supabase.rpc("clean_old_messages");
  if (error) {
    console.error("Erreur nettoyage:", error.message);
    return new Response("Erreur lors du nettoyage", { status: 500 });
  }
  return new Response("Nettoyage terminé");
}

