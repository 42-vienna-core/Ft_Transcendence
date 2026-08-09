import EditProfileForm from "@/components/profile/edit-form";
import ProfileSettingsContent from "@/components/profile/settings";

export default function Profile() {
    return (
        <div className="font-sans text-sm text-text-primary">
            <EditProfileForm />

            <div className="mt-[18px] mb-[22px] grid grid-cols-4 gap-2.5">
                <div className="rounded-md bg-bg-subtle px-3.5 py-3">
                    <div className="text-xs text-text-secondary">rating</div>
                    <div className="mt-0.5 text-xl font-medium tabular-nums text-text-primary">1 482</div>
                    <div className="mt-0.5 text-xs text-success">+14 today</div>
                </div>
                <div className="rounded-md bg-bg-subtle px-3.5 py-3">
                    <div className="text-xs text-text-secondary">global rank</div>
                    <div className="mt-0.5 text-xl font-medium tabular-nums text-text-primary">#3 920</div>
                    <div className="mt-0.5 text-xs text-success">top 8 %</div>
                </div>
                <div className="rounded-md bg-bg-subtle px-3.5 py-3">
                    <div className="text-xs text-text-secondary">best score</div>
                    <div className="mt-0.5 text-xl font-medium tabular-nums text-text-primary">1 207</div>
                    <div className="mt-0.5 text-xs text-text-tertiary">last week</div>
                </div>
                <div className="rounded-md bg-bg-subtle px-3.5 py-3">
                    <div className="text-xs text-text-secondary">matches</div>
                    <div className="mt-0.5 text-xl font-medium tabular-nums text-text-primary">182</div>
                    <div className="mt-0.5 text-xs text-text-tertiary">win rate 41 %</div>
                </div>
            </div>

            <div className="mt-1 mb-3.5 flex gap-3.5 border-b border-border-default text-base">
                <span className="-mb-px cursor-pointer border-b-2 border-text-primary pb-1.5 font-medium text-text-primary">
                    settings
                </span>
                <span className="cursor-pointer pb-1.5 text-text-secondary">messages</span>
            </div>

            <ProfileSettingsContent/>
        </div>
    );
}
