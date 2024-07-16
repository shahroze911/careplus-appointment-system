"use server";
import { ID, Query } from "node-appwrite";
import {
	BUCKET_ID,
	DATABASE_ID,
	databases,
	ENDPOINT,
	PATIENT_COLLECTION_ID,
	PROJECT_ID,
	storage,
	users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { IdentificationTypes } from "@/constants";
import { InputFile } from "node-appwrite/file";

export const createuser = async (user: CreateUserParams) => {
	try {
		const validUserId = ID.unique().replace(/^_/, ""); // Generate a valid userId
		const newUser = await users.create(
			validUserId,
			user.email,
			user.phone,
			undefined,
			user.name
		);
		console.log("New user created:", newUser);
		return parseStringify(newUser); // Assuming parseStringify converts newUser to string
	} catch (error: any) {
		if (error && error.code === 409) {
			try {
				const documents = await users.list([Query.equal("email", user.email)]);
				if (documents.users.length > 0) {
					console.log("User with email already exists:", documents.users[0]);
					return documents.users[0]; // Return existing user object
				} else {
					console.log("No user found with email:", user.email);
					throw new Error("User not found"); // Handle case where list operation fails to find user
				}
			} catch (listError) {
				console.error("Error fetching user by email:", listError);
				throw listError; // Re-throw error for higher-level handling
			}
		} else {
			console.error("Error creating user:", error);
			throw error; // Re-throw unexpected error
		}
	}
};

export const getUser = async (userId: string) => {
	try {
		const user = await users.get(userId);
		return parseStringify(user);
	} catch (error) {
		console.log(error);
	}
};

export const getPatient = async (userId: string) => {
	try {
		const patients = await databases.listDocuments(
			DATABASE_ID!,
			PATIENT_COLLECTION_ID!,
			[Query.equal("userId", userId)]
		);

		return parseStringify(patients.documents[0]);
	} catch (error) {
		console.log(error);
	}
};
export const registerPatient = async ({
	identificationDocument,
	...patient
}: RegisterUserParams) => {
	try {
		let file;
		if (identificationDocument) {
			const inputFile = InputFile.fromBuffer(
				identificationDocument?.get("blobFile") as Blob,
				identificationDocument?.get("fileName") as string
			);
			file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
		}

		console.log({
			identificationDocumentId: file?.$id || null,
			identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
			...patient,
		});

		const newPatient = await databases.createDocument(
			DATABASE_ID!,
			PATIENT_COLLECTION_ID!,
			ID.unique(),
			{
				identificationDocumentId: file?.$id || null,
				identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
				...patient,
			}
		);
		return parseStringify(newPatient);
	} catch (error) {
		console.log(error);
	}
};


