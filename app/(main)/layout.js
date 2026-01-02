import React from "react";

const Mainlayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default Mainlayout;
