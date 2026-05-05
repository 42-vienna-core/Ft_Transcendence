"use client"
import { useRouter } from "next/navigation";
import { useState } from "react"
import Data from "../Data";

function Registration() {

	const rout = useRouter();
	const [labelFocus, setLabelFocus] = useState(Data.registr);
	
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
				<h2 className="text-4xl font-bold"> Sign Up
				</h2>
			</div>
			
			<form onSubmit={ async (e) => { 
				e.preventDefault();
				const form = e.currentTarget;
				
				if (form.Password.value != form.ConfirmPassword.value)
				{
					alert("Passwords do not match");
					return ;
				}
				await fetch("http://localhost:4000/user/register", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: form.Email.value,
						password: form.Password.value,
						name: form.Username.value,
						role: "PLAYER"
					})
				})
				.then((res) => {
					
					if (res.ok)
						return rout.push('/Components/Auth/Login');
				})
			}}>
				{labelFocus.map((item, i) => {
					return (
						<div className={Data.formStyle.inputDiv} key={i}>
							<label htmlFor={item.name} className="cursor-pointer">
								<input required placeholder={item.bol ? item.name : ""}
									type={item.type} name={item.name} id={item.id} value={item.value} className={Data.formStyle.inputs}
									onFocus={(e) => { setLabelFocus((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: false} : item)); }}
									onChange={(e) => { setLabelFocus((prev) => prev.map((item) => item.id === e.target.id ? {...item, value: e.target.value} : item)); }}
									onBlur={(e) => { setLabelFocus((prev) => prev.map((item) => item.id === e.target.id ? {...item, bol: true} : item)); }}
								/>
								
							</label>
							<div className={Data.formStyle.imgDiv}>
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
					<div>
						<button className={Data.formStyle.btn_submit} type="submit" >
							Sign Up
						</button>
					</div>
					<div className="p-4 text-lg font-bold flex justify-between">
						<p> 
							Already have an account ? /
							<button  className={Data.formStyle.btn_sin_log}
								type="button" onClick={() => {
									rout.push("/Components/Auth/Login");
								}} >
								 Login
							</button>
						</p>
					</div>
				</div>

			</form>
			
		</div>
	</div>
)}

export default Registration
