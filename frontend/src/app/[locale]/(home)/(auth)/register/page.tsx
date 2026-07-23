import AuthPageLayout from "@/components/authPageLayout";
import RegisterForm from "@/components/register";

export default function Signup() {
    return (
        <AuthPageLayout keyTranslation="Register">
            <RegisterForm/>
        </AuthPageLayout>
    );
}
