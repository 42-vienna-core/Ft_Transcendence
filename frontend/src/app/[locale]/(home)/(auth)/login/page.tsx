import LoginForm from "@/components/login";
import AuthPageLayout from "@/components/authPageLayout";


export default function Login() {
    return (
        <AuthPageLayout keyTranslation="Login">
            <LoginForm />
        </AuthPageLayout>
    );
}
