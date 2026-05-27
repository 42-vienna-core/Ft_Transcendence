const Api = {
    postRequest: async (url: string, obj: object) => {
        const res = await fetch(url,  {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify (obj)
        })
        return res;
    }
}
export default Api;