import { fetchUserProfile } from "~/app/actions/userActions";
import HomeContent from "~/components/HomeContent";

export default async function Home() {
  const user = await fetchUserProfile();

  return (
    <div>
      <HomeContent user={user} />
    </div>
  );
}
