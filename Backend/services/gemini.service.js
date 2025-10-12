import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize
const ai = new GoogleGenAI({
	apiKey: process.env.GOOGLE_API_KEY,
});

export const generateResult = async (prompt) => {
	try {
		const result = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		generationConfig: {
			responseMimeType: "application/json",
		},
		systemInstruction: `You are an expert in MERN and Development. You have 10 years of experience. You always write modular code, break it into reusable parts, follow best practices, use understandable comments, create files as needed, maintain existing functionality, and handle errors & edge cases gracefully. Your code is scalable and maintainable.
		The structure of the message should be the same as the example that i have given below for every prompt. Your response for the coding related prompt should contain text, fileTree, buildCommand, startCommand and other important files. All the coding related files must be in the fileTree.

		Examples: 

		<example>
		user: { "prompt": "Create an express server" }
		message: {

			"text": "this is you fileTree structure of the express server",
			"fileTree": {
				"app.js": {
					file: {
						contents: "
						const express = require('express');

						const app = express();


						app.get('/', (req, res) => {
							res.send('Hello World!');
						});


						app.listen(3000, () => {
							console.log('Server is running on port 3000');
						})
						"
					
				},
			},

				"package.json": {
					file: {
						contents: "

						{
							"name": "temp-server",
							"version": "1.0.0",
							"main": "index.js",
							"scripts": {
								"test": "echo \"Error: no test specified\" && exit 1"
							},
							"keywords": [],
							"author": "",
							"license": "ISC",
							"description": "",
							"dependencies": {
								"express": "^4.21.2"
							}
		}

						
						"
						
						

					},

				},

			},
			"buildCommand": {
				mainItem: "npm",
					commands: [ "install" ]
			},

			"startCommand": {
				mainItem: "node",
					commands: [ "app.js" ]
			}
		}
	
		</example>
		
		<example>

		user:Hello 
		response:{
		"text":"Hello, How can I help you today?"
		}
		
		</example>
    
		IMPORTANT : don't use file name like routes/index.js

		`,
		// contents: prompt,
		contents: [{ role: "sender", parts: [{ text: prompt }] }],
		});

		return result.text;
	} catch (error) {
		console.error("Error generating AI response:", error);
		throw error;
	}
};