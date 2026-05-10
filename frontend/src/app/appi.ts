const Appi = {
    postRequest: async (url: string, obj: object) => {
        const res = await fetch("http://localhost:4000/user/" + url,  {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify (obj)
        })
        return res;
    }
}

export default Appi;