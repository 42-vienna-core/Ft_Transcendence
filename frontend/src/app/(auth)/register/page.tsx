"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../auth.module.css";
import { FormField, State } from "@/lib/definitions";
import { fetchRegister } from "@/lib/action";
import { signIn } from "next-auth/react";

const initialState: State = {
  message: "",
  success: false,
  pending: false,
  refresh: false
}

function getPlaceholder(field: FormField): string {
  if (!field.showPlaceholder) return "";
  if (field.name === "confirmPassword") return "confirm Password";
  return field.name;
}

function Signup() {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [state,  setState] = useState<State>(initialState);

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f));
  }

  function togglePasswordVisibility(field: FormField) {
    if (field.name !== "password" && field.name !== "confirmPassword") return;
    if (field.type === "text") updateField(field.id, { type: "password", src: "/png/secret.png" });
    else updateField(field.id, { type: "text", src: "/png/eye.png" });
  }

  const handleRegistration = async (formData: FormData) => {
    setFields(INITIAL_FIELDS);
    setState({...state, pending: true});

    const res = await fetchRegister(formData);
    setState({...state, ...res});

    if (!state.success) {
      setState({...state, ...res, pending: false});
      return;
    }

    router.push('/login');
    router.refresh();
  }

  return (
    <div className={styles.page}>

      <div className={`glass ${styles.card}`}>
        <div className={styles.cardTitle}>
          <h2>Sign Up</h2>
        </div>

        <form action={handleRegistration}>
          {fields.map((field) => (
            <div className={styles.inputRow} key={field.id}>
              <label htmlFor={field.id} className={styles.inputLabel}>
                <input
                  required
                  id={field.id}
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  placeholder={getPlaceholder(field)}
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
            <button className={styles.submitBtn} type="submit" disabled={state.pending}>
              Sign Up
            </button>
            <div className={styles.switchRow}>
              <p>
                Already have an account? /
                <button
                  className={styles.switchBtn}
                  type="button"
                  onClick={() => router.push("/login")}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const INITIAL_FIELDS: FormField[] = [
  { 
    id: "username", 
    type: "text", 
    name: "username", 
    src: "/png/users.png", 
    value: "", 
    showPlaceholder: true 
  },
  { 
    id: "email",
    type: "email", 
    name: "email", 
    src: "/png/email.png", 
    value: "", 
    showPlaceholder: true 
  },
  { 
    id: "password", 
    type: "password", 
    name: "password", 
    src: "/png/secret.png", 
    value: "", 
    showPlaceholder: true 
  },
  { 
    id: "confirm-password", 
    type: "password", 
    name: "confirmPassword", 
    src: "/png/secret.png", 
    value: "", 
    showPlaceholder: true 
  }
];

export default Signup;
