// import { GoogleGenAI } from "@google/genai";
// import dotenv from 'dotenv';

// dotenv.config();

// const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);
// // const model = ai.({ model: 'gemini-2.5-flash' });

// export const generateResult = async (prompt) => {
// 	try {
// 		const model = ai.models.generateContent({
// 			model: "gemini-2.5-flash",
// 			systemInstructions: 'You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development. You never miss the edge cases and always write code that is scalable and maintainable. In your code, you always handle the errors and exceptions.',
// 			contents: prompt		
// 		});
		
// 		// const result = await model.generateContent([
// 		// 	{
// 		// 		text: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development. You never miss the edge cases and always write code that is scalable and maintainable. In your code, you always handle the errors and exceptions.`
// 		// 	},
// 		// 	{
// 		// 		text: prompt
// 		// 	}
// 		// ]);

// 		const response = await model.response;
// 		return response.contents();
// 	} catch (error) {
// 		console.error('Error generating AI response:', error);
// 		throw error;
// 	}
// }

// // async function main() {
// // 	const response = await ai.models.generateContent({
// // 		model: "gemini-2.5-flash",
// // 		contents: "Explain how AI works in a few words",
// // 	});
// // 	console.log(response.text);
// // }

// // await main();




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
		systemInstruction: `You are an expert in MERN and Development. 
		You have 10 years of experience. 
		You always write modular code, break it into reusable parts, 
		follow best practices, use understandable comments, 
		create files as needed, maintain existing functionality, 
		and handle errors & edge cases gracefully. 
		Your code is scalable and maintainable.
		
		Examples: 

		<example>
		user: "create an express server"
		response: {
		"text": "this is your fileTree structure of the express server",
		"fileTree": {
			"app.js": {
			content: "
			const express = require('express');

			const app = express();

			app.get('/', (req, res) => {
				res.send('Hello World');
			});

			app.listen(3000, () => {
				console.log('Server is running on port 3000');
			});
			"
			},

			"package.json": {
			content: "
			{
				"name": "temp-server",
				"version": "1.0.0",
				"main": "app.js",
				"scripts": {
					"test": "echo \"Error: no test specified\" && exit 1"
				},
				"keywords": [],
				"author": "",
				"license": "ISC",
				"description": "",
				"dependencies": {
					"express": "^5.1.0"
				}
			}
			"
			}
			},

			"buildCommand": {
				mainItem: "npm",
				commands: ["install"]
			},

			"startCommand": {
			mainItem: "node",
			commands: ["app.js"]
			}
		}
		</example>

		<example>
			user: "Hello"
			response: {
				"text": "Hello, How can I help you today?"
			}
		</example>

		`,
		contents: `${prompt}`,
		// contents: [{ role: "sender", parts: [{ text: prompt }] }],
		});

		return result.text;
	} catch (error) {
		console.error("Error generating AI response:", error);
		throw error;
	}
};

// Example usage
// async function main() {
//   const response = await generateResult("Explain how AI works in a few words");
//   console.log(response);
// }

// main();

