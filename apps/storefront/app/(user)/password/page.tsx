import { PasswordForm } from "./password-form";

export default async function ChangePassword() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <PasswordForm />
    </div>
  );
}
