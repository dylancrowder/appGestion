"use client";

import ConversionRateInput from "@/components/ConvercionRateInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Welcome = () => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        Backend: <span className="text-indigo-600">{backendUrl}</span>
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="default" className="w-full sm:w-auto">
            Dashboard
          </Button>
        </Link>

        <Link href="/login">
          <Button variant="outline" className="w-full sm:w-auto">
            Login
          </Button>
        </Link>
      </div>
 
 <ConversionRateInput className="mb-4" />




    </div>
  );
};

export default Welcome;
