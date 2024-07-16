import PatientForm from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import { getPatient } from "@/lib/actions/patient.actions";
import * as Sentry from "@sentry/nextjs";
import AppointmentForm from "@/components/forms/AppointmentForm";
export default async function NewAppointment({
	params: { userId },
	setOpen, // Accept setOpen as a prop if necessary
}: SearchParamProps & { setOpen: (open: boolean) => void }) {
	const patient = await getPatient(userId);

	Sentry.metrics.set("user_view_new_appointment", patient.name);
	return (
		<div className="flex h-screen max-h-screen">
			<section className="remove-scrollbar container my-auto">
				<div className="sub-container max-w-[860px] flex-1 justify-between">
					<Image
						src="/assets/icons/logo-full.svg"
						height={1000}
						width={1000}
						alt="patient"
						className="mb-12 h-10 w-fit"
					/>

					<AppointmentForm
						type="create"
						userId={userId}
						patientId={patient.$id}
						setOpen={setOpen} // Pass setOpen here if needed
					/>

					<p className="copyright mt-10 py-12">Copyright 2024 Carepulse</p>
				</div>
			</section>
			<Image
				src="/assets/images/appointment-img.png"
				height={1000}
				width={1000}
				alt="patient"
				className="side-img max-w-[390px] bg-bottom"
			/>
		</div>
	);
}
