import { cookies } from "next/headers";

interface Token {
	"accessToken": string,
	"refreshToken": string,
}

export async function POST ( req : Request) {
	
	const cookieStore = await cookies();
	const body =  await req.json();
	const res: Token = await fetch("http://localhost:4000/api/auth/register", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	}).then((res) => res.json());

    if (res.accessToken === undefined || res.refreshToken === undefined)
    {
        console.log("Registration failed");
		return ;
    }
	cookieStore.set("accessToken", res.accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 15,
		path: "/",

	});

	cookieStore.set("refreshToken", res.refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 24 * 7,
		path: "/",
	})

	return Response.json( { success: true });
}