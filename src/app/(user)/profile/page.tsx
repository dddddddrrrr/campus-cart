import { redirect } from "next/navigation";
import UserProfile from "~/components/UserProfile";
import { auth } from "~/server/auth";

const ProfilePage = async () => {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  return (
    <div>
      <UserProfile />
    </div>
  );
};

export default ProfilePage;
