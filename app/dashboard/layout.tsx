// app/layout.tsx
import Sidebar from "@/components/Sidebar"; 

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {



  // 检查当前路径，如果是根路径，则重定向到 BasicInfo


  return (

        <div className="flex flex-col min-h-screen w-full">
          <div className="flex flex-1 w-full">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>

  );
}