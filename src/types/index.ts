
import { Tables } from "@/integrations/supabase/types";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  status: string; // Changed from union type to string to accept any value
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time: number | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CampWorkAssignment = Tables<"camp_work_assignments"> & {
  work_teams: Tables<"work_teams">;
  tents: Tables<"tents"> & {
    tent_families: (Tables<"tent_families"> & {
      tent_children: Tables<"tent_children">[];
    })[];
  };
  tent_families: (Tables<"tent_families"> & {
    tent_children: Tables<"tent_children">[];
  })[];
};

export type CampFamilyAssignment = Tables<"camp_family_assignments"> & {
  work_teams: Tables<"work_teams">;
  tent_families: Tables<"tent_families"> & {
    tent_children: Tables<"tent_children">[];
  };
};

export type CampRegistration = Tables<"camp_registrations"> & {
  families: Tables<"families"> & {
    family_children?: Tables<"family_children">[];
  };
};
