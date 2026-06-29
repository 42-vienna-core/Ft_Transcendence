import * as z from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})

export const registerSchema = z.object({
    username: z.string().nonempty(),
    email: z.email({message: "must be a valid email"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters"}),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const changePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8, {message: "Password must be at least 8 characters"}),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

