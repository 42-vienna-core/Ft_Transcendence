"use client"

import { useRouter } from "next/navigation";
import { useState } from "react"
import Data from "@/src/lib/data";
import Styles from "@/src/styles/styles";
import { Api } from "@/src/lib/api";

export default function Register() {

	const router = useRouter();
	const [labelFocus, setLabelFocus] = useState(Data.data);
    const [password, setPassword] = useState("");
	
return (
	
	<div  className="bg w-full h-screen flex min-w-md items-center justify-center" >

		<div className="w-full max-w-md min-w-md mx-auto p-6 glass rounded-2xl">

			<div className="w-full text-center my-3">
				<h2 className="text-4xl font-bold"> Sign Up
				</h2>
			</div>
			<form onSubmit={ async (e) => { 
					e.preventDefault();
					const form = Object.fromEntries(new FormData(e.currentTarget));
					if (form.Password != form.ConfirmPassword)
                        return setPassword("Wrong password try again");
					const {ConfirmPassword, ...data} = form;
					await Api.postRequest("/api/auth", {...data, url: "register"} )
					.then(res => res.ok ? (router.push("/"), router.refresh()): console.log(res));
				 }}
			>
				{labelFocus.map((item, i) => {
					return (
						<div className={Styles.formStyle.inputDiv} key={i}>
							<label htmlFor={item.name} className="cursor-pointer">
								<input required placeholder={item.bol ? item.name : ""}
									type={item.type} name={item.name} id={item.id} value={item.value} className={Styles.formStyle.inputs}
									onFocus={(e) => { setLabelFocus((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: false} : item)); }}
									onChange={(e) => { setLabelFocus((prev) => prev.map((item) => item.id === e.target.id ? {...item, value: e.target.value} : item)); }}
									onBlur={(e) => { setLabelFocus((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: true} : item)); }}
								/>
							</label>
							<div className={Styles.formStyle.imgDiv}>
								<img src={`${item.src}`} alt="icon" id={item.id} className="w-15  min-w-8 cursor-pointer"
									onClick={(e) => {
										const target = e.currentTarget;
										setLabelFocus((prev) => (
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
                    { password.length > 1 && (
                            <div className="text-red-700 m-2">
                                {password}
                            </div>
                        )
                    }
					<div>
						<button className={Styles.formStyle.btn_submit} type="submit" >
							Sign Up
						</button>
					</div>
					<div className="p-4 text-lg font-bold flex justify-between">
						<p> 
							Already have an account ? /
							<button  className={Styles.formStyle.btn_sin_log} type="button" onClick={() => router.push("/login")} >
								Login
							</button>
						</p>
					</div>
				</div>

			</form>
		</div>
	</div>
)}
