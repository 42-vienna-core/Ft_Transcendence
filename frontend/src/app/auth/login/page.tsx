"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../auth.module.css";

type FormField = {
  id: string;
  type: string;
  name: string;
  src: string;
  value: string;
  showPlaceholder: boolean;
};

const INITIAL_FIELDS: FormField[] = [
  { id: "email", type: "email", name: "Email", src: "/png/email.png", value: "", showPlaceholder: true },
  { id: "password", type: "password", name: "Password", src: "/png/secret.png", value: "", showPlaceholder: true },
];

function Login() {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f));
  }

  function togglePasswordVisibility(field: FormField) {
    if (field.name !== "Password" && field.name !== "ConfirmPassword") return;
    if (field.type === "text") updateField(field.id, { type: "password", src: "/png/secret.png" });
    else updateField(field.id, { type: "text", src: "/png/eye.png" });
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const email = fields.find((f) => f.name === "Email")?.value ?? "";
    const password = fields.find((f) => f.name === "Password")?.value ?? "";

    const res = await fetch("http://localhost:4000/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) router.push("/");
    else alert("Wrong password or login");
  }

  return (
    <div className={styles.page}>
      <div className={`glass ${styles.card}`}>
        <div className={styles.cardTitle}>
          <h2>Login</h2>
        </div>

        <form onSubmit={handleSubmit}>
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

          <div className={styles.actions}>
            <button className={`${styles.submitBtn} `} type="submit">
              Login
            </button>
            <div className={styles.switchRow}>
              <p>
                Don&apos;t have an account? /
                <button
                  className={styles.switchBtn}
                  type="button"
                  onClick={() => router.push("/auth/signup")}
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
            onClick={() => router.push("/auth/reset-password")}
          >
            Forgot your password
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
