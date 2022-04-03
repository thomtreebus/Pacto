/**
 * Displays a Not Found message when a 404 error is encountered
 */

import React from "react";
import { Card, Toolbar, Typography } from "@mui/material";
import logo from '../assets/foiled-again-foil.gif';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

/**
 * A page shown when the app can't find the desired page.
 * @returns {JSX.Element}
 */
export default function NotFound() {
	return (
		<>
			<Toolbar/>
			<Card sx={{ maxWidth: 690, margin: "auto" }}>
			<CardMedia
				component="img"
				height="280"
				image={logo}
				alt="not-found"
			/>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					ERROR 404
				</Typography>
				<Typography variant="body2" color="text.secondary">
					The Page you are looking for was not found!
				</Typography>
			</CardContent>
		</Card>
	</>
	);
}

