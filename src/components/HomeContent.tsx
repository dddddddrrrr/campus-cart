"use client";

import { type User } from "@prisma/client";

const HomeContent = ({ user }: { user: User | null }) => {
  return (
    <div>
      <h1>Home</h1>
      <p>{user?.name ?? "Unknown User"}</p>
    </div>
  );
};

export default HomeContent;
