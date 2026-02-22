import { NextResponse } from "next/server";
import { getAdp, getNews } from "@/utils/tank01";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "adp") {
      const data = await getAdp();
      return NextResponse.json(data);
    }

    if (type === "news") {
      const data = await getNews();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Invalid type. Use ?type=adp or ?type=news" },
      { status: 400 },
    );
  } catch (err) {
    console.error(`[/api/tank01] error [type=${type}]:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
