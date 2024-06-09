import { redirect } from 'next/navigation'

const CancelPage = () => {
  redirect("/");
  return null;
};

export default CancelPage;
