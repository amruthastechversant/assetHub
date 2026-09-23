import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";

function SectionSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid rgba(148, 163, 184, 0.18)",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        {/* Section header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid rgba(148,163,184,0.14)" }}>
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="text" width={130} height={20} />
        </Box>

        {/* Rows */}
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ mb: i < 3 ? 1.75 : 0 }}>
            <Skeleton variant="text" width={90} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DevicePageLoading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f0f7ff 0%, #f8fafc 60%, #ffffff 100%)",
      }}
    >
      {/* AppBar skeleton */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.9)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          boxShadow: "none",
        }}
      >
        <Container maxWidth="md" disableGutters>
          <Toolbar sx={{ minHeight: { xs: 60, md: 68 }, px: { xs: 2, md: 3 }, gap: 1.5 }}>
            <Skeleton variant="rounded" width={38} height={38} />
            <Skeleton variant="rounded" width={30} height={30} />
            <Skeleton variant="text" width={120} height={24} />
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
          {/* Hero card skeleton */}
          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 3, md: 4 },
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 50%, #f0f7ff 100%)",
              boxShadow: "0 4px 24px rgba(29, 78, 216, 0.08)",
            }}
          >
            <CardContent sx={{ pt: { xs: 3, md: 3.5 }, pb: { xs: 2.5, md: 3 }, px: { xs: 2.5, md: 3.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "center", md: "flex-start" },
                  gap: { xs: 2, md: 3 },
                }}
              >
                <Skeleton
                  variant="rounded"
                  sx={{ width: { xs: 72, md: 80 }, height: { xs: 72, md: 80 }, flexShrink: 0, borderRadius: 3 }}
                />
                <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, width: "100%" }}>
                  <Skeleton variant="text" width={80} height={16} sx={{ mb: 0.5, mx: { xs: "auto", md: 0 } }} />
                  <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1, mx: { xs: "auto", md: 0 } }} />
                  <Box sx={{ display: "flex", gap: 1.5, justifyContent: { xs: "center", md: "flex-start" } }}>
                    <Skeleton variant="text" width={60} height={20} />
                    <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 6 }} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Sections skeleton */}
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
                <SectionSkeleton />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
