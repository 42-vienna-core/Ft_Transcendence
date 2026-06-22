import Container from "@/components/container";
import React from "react";

export default function DashboardLayout ({children}: {children: React.ReactNode}) {
    return (<Container>{children}</Container>)
}