import { Card, CardHeader, CardContent, Typography } from "@mui/material";

export default function AboutPact({ pact }) {
  return (
    <Card sx={{ width: "100%" }} data-testid="about-pact">
      <CardHeader title="About Pact" subheader={pact.name} sx={{ backgroundColor: "darkgray" }} />
      <CardContent>
        <Typography>
          {pact.description}
        </Typography>
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