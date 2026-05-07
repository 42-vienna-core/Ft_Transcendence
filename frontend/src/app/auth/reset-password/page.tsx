"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../auth.module.css";

type FormField = {
  id: string;
  type: string;
  name: string;
  src: string;
  value: string;
  showPlaceholder: boolean;
};

const EMAIL_FIELD: FormField = {
  id: "email", type: "email", name: "Email", src: "/png/email.png", value: "", showPlaceholder: true,
};

const PASSWORD_FIELDS: FormField[] = [
  { id: "email", type: "email", name: "Email", src: "/png/email.png", value: "", showPlaceholder: true },
  { id: "password", type: "password", name: "Password", src: "/png/secret.png", value: "", showPlaceholder: true },
  { id: "confirm-password", type: "password", name: "ConfirmPassword", src: "/png/secret.png", value: "", showPlaceholder: true },
];

function getPlaceholder(field: FormField): string {
  if (!field.showPlaceholder) return "";
  if (field.name === "Password") return "New Password";
  if (field.name === "ConfirmPassword") return "Confirm Password";
  return field.name;
}

function ResetPass() {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>([EMAIL_FIELD]);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (!codeSent) return;

    const code = prompt("Confirmation code");
    const timer = setTimeout(() => {
      if (code) {
        // handle confirmation code verification
      }
    }, 2 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [codeSent]);

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

    if (codeSent) {
      const password = fields.find((f) => f.name === "Password")?.value;
      const confirmPassword = fields.find((f) => f.name === "ConfirmPassword")?.value;
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    const res = await fetch("http://localhost:4000/user/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fields.find((f) => f.name === "Email")?.value ?? "",
      }),
    });

    if (res.ok) {
      await res.json();
      setCodeSent(true);
      setFields(PASSWORD_FIELDS);
    } else {
      alert("Wrong email address");
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.homeBtn} type="button" onClick={() => router.push("/")}>
        <img src="/png/home.png" alt="home" className={styles.homeImg} />
      </button>

      <div className={`glass ${styles.card}`}>
        <div className={styles.cardTitle}>
          <h2>Reset Password</h2>
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
              {codeSent ? "Reset password" : "Send code"}
            </button>
          </div>
        </form>

        <div className={styles.footerLinks}>
          <button type="button" className={styles.linkBtn} onClick={() => router.push("/auth/login")}>
            Login
          </button>
          <span className={styles.separator}>/</span>
          <button type="button" className={styles.linkBtn} onClick={() => router.push("/auth/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPass;
