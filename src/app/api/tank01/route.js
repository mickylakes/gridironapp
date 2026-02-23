import { NextResponse } from "next/server";
import { getAdp, getNews, getByeWeeks, getPlayerInfo, getProjections } from "@/utils/tank01";

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

    if (type === "bye") {
      const data = await getByeWeeks();
      return NextResponse.json(data);
    }

    if (type === "playerinfo") {
      const data = await getPlayerInfo();
      return NextResponse.json(data);
    }

    if (type === "projections") {
      const data = await getProjections();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Invalid type. Use ?type=adp|news|bye|playerinfo|projections" },
      { status: 400 },
    );
  } catch (err) {
    console.error(`[/api/tank01] error [type=${type}]:`, err);
    return NextResponse.json({ error: "Failed to fetch data. Please try again." }, { status: 500 });
  }
}
