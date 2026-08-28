import EditProfileForm from "@/components/profile/edit-form";
import ProfileSettingsContent from "@/components/profile/settings";

export default function Profile() {
    return (
        <div className="font-sans text-sm text-text-primary">
            <EditProfileForm />
            <ProfileSettingsContent/>
        </div>
    );
}
