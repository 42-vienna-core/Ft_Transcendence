"use client"
import { useRouter } from "next/navigation";
import { useState} from "react"
import Styles from "@/src/styles/styles";
import Data from "@/src/lib/data"
import { Api } from "@/src/lib/api"
import { useAuth } from "@/src/components/provider/UserProvider";

export default function Login() {

	const	{refreshUser} = useAuth();
	const	router = useRouter();
	const	[loginData, setLoginData] = useState(Data.data.slice(1, 3));
	const	[login, setLogin] = useState("");

return (

	<div  className="bg w-full h-screen flex  items-center justify-center" >

		<div className="w-full max-w-md  mx-auto p-6 glass rounded-2xl">

			<div className="w-full text-center my-3">
				<h2 className="text-4xl font-bold"> Login </h2>
			</div>
			
			<form onSubmit={ async (e) => { 
				e.preventDefault();
				const form = Object.fromEntries(new FormData(e.currentTarget));
			 	await Api.postRequest("/api/auth", {...form, url: "login"} )
				.then( async (res) => res.ok ? (refreshUser(), router.push("/")): (console.log(res), setLogin("Wrong Email or Password")))
			}}
            >
				{loginData.map((item, i) => {
					return (
						<div className={Styles.formStyle.inputDiv} key={i}>
							<label htmlFor={item.name} className="cursor-pointer">
								<input required placeholder={item.bol ? item.name : ""}
									type={item.type} name={item.name} id={item.id} value={item.value} className={Styles.formStyle.inputs}
									onFocus={(e) => { setLoginData((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: false} : item)); }}
									onChange={(e) => { setLoginData((prev) => prev.map((item) => item.id === e.target.id ? {...item, value: e.target.value} : item)); }}
									onBlur={(e) => { setLoginData((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: true} : item)); }}
								/>
							</label>
							<div className={Styles.formStyle.imgDiv}>
								<img src={`${item.src}`} alt="icon" id={item.id} className="w-15  min-w-8 cursor-pointer"
									onClick={(e) => {
										const target = e.currentTarget;
										setLoginData((prev) => (
											prev.map((item) => {
												if (item.id === target.id && (item.name === "Password" || item.name === "ConfirmPassword"))
												{
													if (item.type === "text")
														return {...item, type: "password", src: "/png/secret.png"}
													else
														return {...item, type: "text", src: "/png/eye.png"}
												}
												else
													return item;
											})
										));
									}}
								/>
							</div>
						</div>
					)
				})}
				
				<div className="m-5 text-center">
					<div >
						{login.length > 0 && (
							<div className="text-red-800 mt-2 mb-2">
								{login}
							</div>
						)

						}
						<button className={Styles.formStyle.btn_submit} type="submit" > 
                            Login
						</button>
					</div>
					<div className="p-4 text-lg font-bold flex justify-between">
						<p>
							Don't have an account ? / 
							<button  className={Styles.formStyle.btn_sin_log} type="button"  onClick={() => router.push("/register") } >
								Sign Up
							</button>
						</p>
					</div>
				</div>

			</form>
			<div className="text-center  ">
				<button onClick={() =>  router.push('/reset') } type="button" className="hover:border-b hover:border-blue-400 transform-y cursor-pointer">
					Forgot your password 
				</button>
			</div>
		</div>
	</div>
)}