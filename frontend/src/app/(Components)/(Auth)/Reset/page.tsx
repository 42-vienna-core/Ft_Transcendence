"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import Data from "../../../styles";

async function request(url: string, opbject: Object) {
	let resutl = false;
	await fetch("http://localhost:4000/user/" + url,  {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify (opbject)
		})
		.then((res) => resutl = res.ok);
	return resutl;
}
function Registration() {

	const	rout = useRouter();
	const	[loginData, setLoginData] = useState(Data.registr.slice(1, 4));
	const	[object, setObject] = useState({email: undefined, password: undefined, code:undefined});
	
	useEffect(() => {
		if (object.email == undefined) return;
	 	let value = request("find", {email: object.email});
		if (!value) 
			return 	alert("Email not found");
		let code =  prompt("Enter the code sent to your email");
		value = request("code", {...object, code,});
		if (!value)
			return alert("Wrong code");
		rout.push("/Login");
	}, [object])

return (
	<div  className="bg w-full h-screen flex min-w-md items-center justify-center" >

		<div className="w-full max-w-md min-w-md mx-auto p-6 glass rounded-2xl">

			<div className="w-full text-center my-3">
				<h2 className="text-4xl font-bold"> Reset password</h2>
			</div>
			
			<form onSubmit={ async (e) => { 
				e.preventDefault();
				const form = e.currentTarget;
			
				if (form.Password.value != form.ConfirmPassword.value)
					return alert("Passwords do not match");
				setObject({
					...object,
					email: form.Email.value,
					password: form.Password.value,
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
						<button className={Data.formStyle.btn_submit} type="submit"> 
							Reset password
						</button>
					</div>
				</div>
			</form>
			
		</div>
		
	</div>
)}

export default Registration
