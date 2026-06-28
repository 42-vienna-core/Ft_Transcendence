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
    const res: AuthType = await Api.postRequest("http://localhost:4000/api/auth/" + body.url , data)
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


export async function GET(req: Request) {
  console.log(req);
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const res = Api.getUser(accessToken || "");
  

  return NextResponse.json({ message: "hello I am Rafayel" });
}