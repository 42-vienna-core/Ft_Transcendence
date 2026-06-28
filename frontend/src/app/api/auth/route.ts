import { NextResponse } from "next/server";
import { Api } from "@/src/lib/api"
import { AuthType } from "@/src/types/Types";
import { cookies } from "next/headers";

export async function POST ( req : Request) {

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
  }
    const body =  await req.json();
    const {url, ...data} = body;
    const res: AuthType = await Api.postRequest(process.env.INTERNAL_API_URL + "/auth/" + body.url , data)
    .then(res => res.json());

    if (res.accessToken === undefined || res.refreshToken === undefined)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const response = NextResponse.json({success: true});
    response.cookies.set("accessToken", res.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/",
    });

    response.cookies.set("refreshToken", res.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });
   
    return response;
}

export async function GET () {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken)
        return Response.json(null, {status: 401});
    const user = await Api.getUser(accessToken).then((r) => r.json());
    console.log("get request me user ",user)
    return Response.json(user);
}