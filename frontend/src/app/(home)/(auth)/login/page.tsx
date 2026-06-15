"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../auth.module.css";
import { FormField, State } from "@/lib/definitions";
import { fatchLogin } from "@/lib/actions/auth-actions";
import { signIn } from "next-auth/react";
import SubmitButton from "@/ui/submit-btn";

const initialState: State = {
  message: "",
  success: false,
}

function Login() {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [state,  setState] = useState<State>(initialState);

  function updateField(id: string, patch: Partial<FormField>) {
    setState(prev => ({...prev, message: ""}));
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f));
  }

  function togglePasswordVisibility(field: FormField) {
    if (field.name !== "password" && field.name !== "confirmPassword") return;
    if (field.type === "text") {
      updateField(field.id, { type: "password", src: "/png/secret.png" });
    } else {
      updateField(field.id, { type: "text", src: "/png/eye.png" });
    }
  }

  const handleLogin = async (formData: FormData) => {

    const res = await fatchLogin(formData);
    setState(prev => ({...prev, ...res}));

    if (!res.success) return ;

    const registerResult = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    });

    if (registerResult?.error) {
      setState(prev =>({
        ...prev,
        success: false, 
        message: 'login failed', 
      }));
      return;
    } 
    
    router.push('/dashboard');
    router.refresh();
    
  }

  return (
    <div className={styles.page}>
      <div className={`glass ${styles.card}`}>
        <div className={styles.cardTitle}>
          <h2>Login</h2>
        </div>

        <form action={handleLogin}>
          {fields.map((field) => (
            <div className={styles.inputRow} key={field.id}>
              <label htmlFor={field.id} className={styles.inputLabel}>
                <input
                  required
                  id={field.id}
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  placeholder={field.showPlaceholder ? field.name : ""}
                  className={styles.input}
                  onFocus={() => updateField(field.id, { showPlaceholder: false })}
                  onChange={(e) => updateField(field.id, { value: e.target.value })}
                  onBlur={() => updateField(field.id, { showPlaceholder: true })}
                />
              </label>
              <div className={styles.iconWrapper}>
                <img
                  src={field.src}
                  alt="icon"
                  className={styles.icon}
                  onClick={() => togglePasswordVisibility(field)}
                />
              </div>
            </div>
          ))}
          <div className={styles.errorBox}>
            <p className={styles.errorMessage}>{state?.message}</p>
          </div>
          <div className={styles.actions}>
            <SubmitButton label="Login" loadingLabel="Logging..."/>
            <div className={styles.switchRow}>
              <p>
                Don&apos;t have an account? /
                <button
                  className={styles.switchBtn}
                  type="button"
                  onClick={() => router.push("/register")}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </form>

        <div className={styles.footerCenter}>
          <button
            className={styles.linkBtn}
            type="button"
            onClick={() => router.push("/reset-password")}
          >
            Forgot your password
          </button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_FIELDS: FormField[] = [
  { 
    id: "email",
    type: "email",
    name: "email", 
    src: "/png/email.png", 
    value: "", showPlaceholder: true 
  },
  { id: "password", 
    type: "password", 
    name: "password", 
    src: "/png/secret.png", 
    value: "", showPlaceholder: true 
  },
];

export default Login;
