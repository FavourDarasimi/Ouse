"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ProfileActionResponse {
  data: { full_name: string } | { avatar_url: string } | null;
  error: string | null;
}

export async function updateProfile(data: {
  fullName: string;
}): Promise<ProfileActionResponse> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "You must be logged in." };

  if (!data.fullName.trim()) {
    return { data: null, error: "Full name is required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName.trim(),
    })
    .eq("id", user.id);

  if (error) return { data: null, error: "Failed to update profile. Please try again." };

  revalidatePath("/landlord/profile");
  revalidatePath("/tenant/profile");

  return { data: { full_name: data.fullName.trim() }, error: null };
}

export async function uploadAvatar(formData: FormData): Promise<ProfileActionResponse> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "You must be logged in." };

  const file = formData.get("avatar") as File | null;
  if (!file) return { data: null, error: "No file provided." };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: "Only JPEG, PNG, and WebP images are allowed." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { data: null, error: "File must be under 2MB." };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { data: null, error: "Failed to upload image." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { data: null, error: "Failed to update profile picture." };

  revalidatePath("/landlord/profile");
  revalidatePath("/tenant/profile");

  return { data: { avatar_url: publicUrl }, error: null };
}
