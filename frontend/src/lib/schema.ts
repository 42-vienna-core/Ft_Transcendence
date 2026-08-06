import * as z from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})

export const registerSchema = z.object({
    username: z.string().nonempty(),
    email: z.email(),
    password: z.string().min(8),
    passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"]
});

export const changePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["passwordConfirm"]
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

