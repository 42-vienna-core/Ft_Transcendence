import AuthPageLayout from "@/components/authPageLayout";
import ResetPass from "@/components/reset"

export default function Signup() {
    return (
        <AuthPageLayout keyTranslation="Reset">
           <ResetPass />
        </AuthPageLayout>
    );
}
