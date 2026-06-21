
export const Api = {
    postRequest: async (url: string, obj: object) => {
        const res = await fetch(url,  {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify (obj)
        })
        return res;
    },
    getRequest: async (url: string) =>
    {
        const res = fetch(url);
        return res;
    },
    deleteRequest: async (url: string) =>
    {
        const res = await fetch(url, {
            method: "DELETE",
        })
        return res;
    },
    getUser: async (accessToken: string) => {
        const user = await fetch("http://localhost:4000/api/auth/me", {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({accessToken: accessToken})
        });
        return user;
    },
}
