
const Api = {
    postRequest: async (url: string, obj: object) => {
        console.log(url, obj);
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
        try {
            const res = fetch(url).then((res) => res.json());
            return res;
        }
        catch {
            console.log("try again");
        }
    },
    deleteRequest: async (url: string) =>
    {
        const res = await fetch(url, {
            method: "DELETE",
        })
        return res;
    }
}
export default Api;