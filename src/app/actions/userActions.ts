import { api } from "~/trpc/server";

export const fetchUserProfile = async () => {
  const user = await api.user.fetchUserProfile();
  return user;
};
