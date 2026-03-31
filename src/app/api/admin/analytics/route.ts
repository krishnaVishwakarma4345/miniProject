import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		message: "Admin analytics endpoint placeholder",
		status: "ok",
	});
}
