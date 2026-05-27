"use client"
import Features from "./Features"
// import {io } from "socket.io-client"
// import { useEffect } from "react";

function page() {

//     const socket = io("ws://localhost:2000/");
//    useEffect(() => {
       

//         socket.on("connect", () => {
//             console.log("✅ Socket connected!", socket.id);
//         });

//         socket.on("disconnect", () => {
//             console.log("❌ Connection stopped");
//         });

//         return () => {
//             socket.disconnect();
//         };

//     }, []);
    
    return (<Features />)
}

export default page
