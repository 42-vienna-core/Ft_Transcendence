import { Api } from "@/src/lib/api"
import { cookies } from "next/headers"

export async function GET () {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken)
        return Response.json(null, {status: 401});
    const user = await Api.getUser(accessToken).then((r) => r.json());
    console.log("get request me user ",user)
    return Response.json(user);
}
