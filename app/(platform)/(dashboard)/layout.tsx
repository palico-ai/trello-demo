import { PalicoContextProvider } from "@/components/copilot_chat_widget/palico_contex";
import { Navbar } from "./_components/navbar";

const DashboardLayout = ({ 
  children
}: { 
  children: React.ReactNode;
 }) => {
  return (
    <div className="h-full">
      <PalicoContextProvider deploymentId={7}>
        <Navbar />
        {children}
      </PalicoContextProvider>
    </div>
  );
 };

 export default DashboardLayout;
