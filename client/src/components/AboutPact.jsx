import { Card, CardHeader, CardContent, Typography, Divider } from "@mui/material";

export default function AboutPact({ pact }) {
  return (
    <Card sx={{ width: "100%" }} data-testid="about-pact">
      <CardHeader title="About Pact" subheader={pact.name} sx={{ backgroundColor: "darkgray" }} />
      <CardContent>
        <Typography>
          {pact.description}
        </Typography>
        <Divider sx={{ margin: "20px" }} />
        <Typography >
          {pact.members.length + " members"}
        </Typography>
        <Typography>
          {pact.posts.length + " posts"}
        </Typography>
      </CardContent>
    </Card>
  )
}