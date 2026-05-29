import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function isLandlordVerified(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("kyc_status")
    .eq("id", userId)
    .single();
  return data?.kyc_status === "verified";
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const body = await request.json();

  const verified = await isLandlordVerified(user.id);

  const payload = {
    ...body,
    landlord_id: user.id,
    available: verified ? body.available : false,
  };

  const { data, error } = await admin
    .from("listings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!verified && body.available) {
    return NextResponse.json({
      data,
      kycRequired: true,
      message: "Verify your identity to make listings available.",
    });
  }

  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  }

  if ("available" in updates && updates.available === true) {
    const verified = await isLandlordVerified(user.id);
    if (!verified) {
      return NextResponse.json({
        error: "Verify your identity before activating this listing.",
        kycRequired: true,
      }, { status: 403 });
    }
  }

  const { data, error } = await admin
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
