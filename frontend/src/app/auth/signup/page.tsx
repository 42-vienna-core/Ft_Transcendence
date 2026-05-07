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
  { id: "username", type: "text", name: "Username", src: "/png/users.png", value: "", showPlaceholder: true },
  { id: "email", type: "email", name: "Email", src: "/png/email.png", value: "", showPlaceholder: true },
  { id: "password", type: "password", name: "Password", src: "/png/secret.png", value: "", showPlaceholder: true },
  { id: "confirm-password", type: "password", name: "ConfirmPassword", src: "/png/secret.png", value: "", showPlaceholder: true },
];

function getPlaceholder(field: FormField): string {
  if (!field.showPlaceholder) return "";
  if (field.name === "ConfirmPassword") return "Confirm Password";
  return field.name;
}

function Signup() {
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
    const username = fields.find((f) => f.name === "Username")?.value ?? "";
    const email = fields.find((f) => f.name === "Email")?.value ?? "";
    const password = fields.find((f) => f.name === "Password")?.value ?? "";
    const confirmPassword = fields.find((f) => f.name === "ConfirmPassword")?.value ?? "";

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("http://localhost:4000/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: username, role: "PLAYER" }),
    });

    if (res.ok) router.push("/auth/login");
  }

  return (
    <div className={styles.page}>

      <div className={`glass ${styles.card}`}>
        <div className={styles.cardTitle}>
          <h2>Sign Up</h2>
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

          <div className={styles.actions}>
            <button className={styles.submitBtn} type="submit">
              Sign Up
            </button>
            <div className={styles.switchRow}>
              <p>
                Already have an account? /
                <button
                  className={styles.switchBtn}
                  type="button"
                  onClick={() => router.push("/auth/login")}
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

export default Signup;
