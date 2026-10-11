import { redirect } from "next/navigation";

export default function RootPage() {
  // توجيه الزائر تلقائياً من / إلى /home
  redirect("/home");
} 