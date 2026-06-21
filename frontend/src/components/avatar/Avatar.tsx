import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/provider/UserProvider"
export default function Ava() {
    const user = useAuth();
    const route = useRouter();
  return   ( 
     <div   onClick={() => route.push("/profile")}
            className="flex justify-between border rounded-3xl bg-blue-900 w-25 h-9.5 m-2 p-2 overflow-hidden cursor-pointer">
        <div>
            <span className="text-gray-100">{user?.Username}</span>    
        </div>
        <div>
            <img  alt="Avatar"  className="w-6.5 h-6.5 rounded-full bg-[#0095ff] text-(--color-info-text) flex items-center justify-center text-[12px] font-medium cursor-pointer" src={"/png/default_avatar.png"}/>       
        </div>
    </div> 
)
}