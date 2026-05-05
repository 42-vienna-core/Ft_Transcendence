"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import Data from "../Data";

function Registration() {


	const	rout = useRouter();
	const	[loginData, setLoginData] = useState(Data.registr.slice(1, 2));
	const	[boolValue , setBoolValue] = useState(true);
	let		newObject = {};

	useEffect(() => {
		if (boolValue) return;

		let value = prompt("Confimation code");

		let time = setTimeout(() =>  {
			
			if (value) {

			}

		}, 2 * 60 * 1000);

	}, [boolValue])
	
return (
	<div  className="bg w-full h-screen flex min-w-md items-center justify-center" >

		<div className="fixed top-10 left-2">
			<div className="">
				<button className="cursor-pointer" type="button" onClick={(e) => rout.push("/")}>
						<img src="/png/home.png" alt="home" className="w-16  transition-transform duration-300 hover:scale-105"/>
				</button>
			</div>
		</div>
		<div className="w-full max-w-md min-w-md mx-auto p-6 glass rounded-2xl">

			<div className="w-full text-center my-3">
				<h2 className="text-4xl font-bold"> Reset password</h2>
			</div>
			
			<form onSubmit={ async (e) => { 
				e.preventDefault();
				const form = e.currentTarget;
			
				if (!boolValue && form.Password.value != form.ConfirmPassword.value)
					return alert("Passwords do not match");
				
				await fetch("http://localhost:4000/user/resetPassword", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify( {
						email: form.Email.value,
					})
				})
				.then((res) => res.ok ? res.json() : alert("Wrong Email Address"))
				.then((obj) => { console.log(obj)
					// setBoolValue(false);
					// setLoginData(Data.registr.slice(1, 4));

				});
			}}>
				{loginData.map((item, i) => {
					return (
						<div className={Data.formStyle.inputDiv} key={i}>
							
							<label htmlFor={item.name} className="cursor-pointer">
								<input required placeholder={item.bol ? (item.name === "Password" ? "New " + item.name : item.name === "ConfirmPassword" ? "Confirm Password" : item.name) : ""}
									type={item.type} name={item.name} id={item.id} value={item.value} className={Data.formStyle.inputs}
									onFocus={(e) => { setLoginData((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: false} : item)); }}
									onChange={(e) => { setLoginData((prev) => prev.map((item) => item.id === e.target.id ? {...item, value: e.target.value} : item)); }}
									onBlur={(e) => { setLoginData((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: true} : item)); }}
								/>
							</label>

							<div className={Data.formStyle.imgDiv}>
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
					<div>
						<button 
							className={Data.formStyle.btn_submit} type="submit"> 
							{boolValue ? "Send code" :  "Reset password"}
						</button>
					</div>
				</div>
				
				
			</form>
			<div className="text-center text-2xl ">
				<button type="button" className="hover:border-b hover:border-blue-600 transform-y cursor-pointer hover:transition-transform duration-600 hover:scale-110" onClick={(e) => rout.push("/Components/Auth/Login")}>
					Login 
				</button>
				<span className="text-2xl mr-2 ml-2"> / </span>
				<button type="button" className="hover:border-b hover:border-blue-600 transform-y cursor-pointer hover:transition-transform duration-600 hover:scale-105" onClick={(e) => rout.push("/Components/Auth/Registr")}>
					Sign Up
				</button>
			</div>
		</div>
		
	</div>
)}

export default Registration
