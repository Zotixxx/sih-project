import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const mapDistrict = (row) =>
  row
    ? {
        id: row.id,
        code: row.id,
        name: row.name,
        state: row.state,
        zone: row.zone,
        controllerOffice: row.controller_office,
        createdAt: row.created_at,
      }
    : null;

export const districtRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin.from("districts").select("*").order("name");
    if (error) throw fromSupabaseError(error, "Could not load districts.");
    return (data || []).map(mapDistrict);
  },
  getById: async (id) => {
    if (!id || id === "ALL") return { id: "ALL", code: "ALL", name: "All Districts", state: null };
    const { data, error } = await supabaseAdmin.from("districts").select("*").eq("id", id).maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load district.");
    return mapDistrict(data);
  },
};
