
export const Api = {
    postRequest: async (url: string, obj: object) => {
       try {
            const res = await fetch(url,  {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify (obj)
            })
            return res;
       }
       catch {
            throw new Error();
       }
    },
    getRequest: async (url: string) =>
    {
        try {
           return fetch(url);
        }
        catch { throw new Error() }
    },
    deleteRequest: async (url: string) =>
    {
        try {
            return  await fetch(url, { method: "DELETE" })
        }
        catch  {
            throw new Error()
        }
    },

    getUser: async (accessToken: string) => {
        try {
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
        }
        catch {
            throw new Error();
        }
    },
}
