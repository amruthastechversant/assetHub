"use client";
import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface RoleBadgeBarProps {
  currentRole: string;
}

const ROLES = [
  { name: "Admin", label: "Admin", icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> },
  { name: "IT Admin", label: "IT Admin", icon: <ManageAccountsOutlinedIcon fontSize="small" /> },
  { name: "Manager", label: "Manager", icon: <SupervisorAccountOutlinedIcon fontSize="small" /> },
  { name: "Employee", label: "Employee", icon: <PersonOutlinedIcon fontSize="small" /> },
];

export default function RoleBadgeBar({ currentRole }: RoleBadgeBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRoleChange = (roleName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", roleName);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 2,
        borderRadius: 3,
        bgcolor: "#ffffff",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ShieldOutlinedIcon sx={{ color: "#2563eb", fontSize: 20 }} />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}
        >
          Role View Simulator:
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        {ROLES.map((r) => {
          const isActive = currentRole.toLowerCase() === r.name.toLowerCase();
          return (
            <Chip
              key={r.name}
              icon={r.icon}
              label={r.label}
              clickable
              onClick={() => handleRoleChange(r.name)}
              color={isActive ? "primary" : "default"}
              variant={isActive ? "filled" : "outlined"}
              size="small"
              sx={{
                fontWeight: isActive ? 700 : 500,
                borderRadius: 2,
                px: 0.5,
                transition: "all 0.2s ease",
                ...(isActive
                  ? {
                      bgcolor: "#2563eb",
                      color: "#ffffff",
                      "& .MuiChip-icon": { color: "#ffffff" },
                    }
                  : {
                      borderColor: "rgba(148, 163, 184, 0.3)",
                      color: "#475569",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }),
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
