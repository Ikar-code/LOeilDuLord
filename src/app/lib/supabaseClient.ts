import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // On n'empêche pas le build, mais on prévient clairement : sans ces deux
  // variables (à ajouter dans Vercel > Settings > Environment Variables),
  // aucune donnée ne pourra être chargée.
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. " +
      "Ajoute-les dans les variables d'environnement Vercel, puis redéploie."
  );
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder"
);
