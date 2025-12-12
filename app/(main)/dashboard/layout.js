import React, { Suspense } from "react";
import { PacmanLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 pt-8 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <PacmanLoader color="gray" />
            </div>
          }
        >
          <div className="bg-white/90 rounded-2xl shadow-xl p-10 border border-gray-200">
            {children}
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Layout;
