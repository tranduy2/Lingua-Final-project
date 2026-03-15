import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("*, lessons(*, vocabulary(*), exercises(*))")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Unit not found. It may not exist or is not published (RLS)." },
      { status: 404 }
    );
  }

  // Ensure nested arrays are never null
  const unit = {
    ...data,
    lessons: (data.lessons ?? []).map((lesson: any) => ({
      ...lesson,
      vocabulary: lesson.vocabulary ?? [],
      exercises: lesson.exercises ?? [],
    })),
  };

  return NextResponse.json(unit);
}
