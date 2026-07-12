import Login from "@/src/components/auth/Login"

import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export default async function page() {
	if ((await cookies()).get("accessToken")?.value)
		redirect("/");
	return <Login />
}
