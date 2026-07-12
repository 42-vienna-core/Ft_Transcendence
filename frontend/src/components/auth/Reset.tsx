"use client"

import { useState }				from "react"
import { useRouter }			from "next/navigation";
import	Styles					from "@/src/styles/styles";
import	Data					from "@/src/lib/data";
import { Api }					from "@/src/lib/api"

export default function Reset() {

	const	router = useRouter();
	const	[resetData, setResetData] = useState(Data.data.slice(1, 4));
	const	[text, setText] = useState("");
	
return (
	<div  className="bg w-full h-screen flex min-w-md items-center justify-center" >

		<div className="w-full max-w-md min-w-md mx-auto p-6 glass rounded-2xl">
			<div className="w-full text-center my-3">
				<h2 className="text-4xl font-bold"> Reset password</h2>
			</div>

			<form onSubmit={ async (e) => { 
				e.preventDefault();
				const form = Object.fromEntries(new FormData(e.currentTarget));
				if (form.Password != form.ConfirmPassword)
					return alert("Passwords do not match");
				const {ConfirmPassword, ...data} = form;
				Api.postRequest("/api/auth", {...data, url: "reset"})
				.then(res => res.ok ? (router.push("/login"), router.refresh()) : setText("something was wrong"));
			}}>
				{resetData.map((item, i) => { 
					return (
						<div className={Styles.formStyle.inputDiv} key={i}>

							<label htmlFor={item.name} className="cursor-pointer">
								<input autoComplete="true" required placeholder={item.bol ? (item.name === "Password" ? "New " + item.name : item.name === "ConfirmPassword" ? "Confirm Password" : item.name) : ""}
									type={item.type} name={item.name} id={item.id} value={item.value} className={Styles.formStyle.inputs}
									onFocus={(e) => { setResetData((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: false} : item)); }}
									onChange={(e) => { setResetData((prev) => prev.map((item) => item.id === e.target.id ? {...item, value: e.target.value} : item)); }}
									onBlur={(e) => { setResetData((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: true} : item)); }}
								/>
							</label>

							<div className={Styles.formStyle.imgDiv}>
								<img src={`${item.src}`} alt="icon" id={item.id} className="w-15  min-w-8 cursor-pointer"
									onClick={(e) => {
										const target = e.currentTarget;
										setResetData((prev) => (
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
					<div>
						{text.length > 1 && (
							<div className="text-red-900 mt-2 mb-2">
								{text}
							</div>
						)}
						<button className={Styles.formStyle.btn_submit} type="submit"> 
							Reset password
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
)}
