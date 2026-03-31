import { redirect } from "next/navigation";

// /learn without a slug is not a valid route — send to course browsing
export default function LearnIndexPage() {
  redirect("/courses");
}
