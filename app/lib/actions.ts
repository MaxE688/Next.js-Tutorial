'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

//schema for form data to update DB
const FormSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	amount: z.coerce.number(),
	status: z.enum(['pending', 'paid']),
	date: z.string(),
});

//form data validation
const CreateInvoice = FormSchema.omit({id: true, date:true});
const UpdateInvoice = FormSchema.omit({id: true, date:true});

export async function createInvoice(formData: FormData) {
	
	//validate formData
	const { customerId, amount, status } = CreateInvoice.parse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});
	
	//format Amount to cents
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split('T')[0];
	
	try{
		//send sql to create row
		await sql`
			INSERT INTO invoices (customer_id, amount, status, date)
			VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
		`;
	} catch(err){
		return {
			message: 'Database Error: Failed to Create Invoice.',
		};
	}
	
	//clear cache
	revalidatePath('/dashboard/invoices');
	
	//return to invoices page
	redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData){
	
	//validate formData
	const { customerId, amount, status } = UpdateInvoice.parse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});
	
	//format amount to cents
	const amountInCents = amount * 100;
	
	try{
		//send sql to update row
		await sql`
			UPDATE invoices
			SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
			WHERE id = ${id}
		`;
	} catch(err) {
		return {
			message: 'Database Error: Failed to Update Invoice.',
		};
	}
	
	//clear cache
	revalidatePath('/dashboard/invoices');
	
	//redirect to invoices page
	redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string){
	// throw new Error("Failed to Delete Invoice");

	try{
		
		//send sql to delete row
		await sql`
			DELETE FROM invoices WHERE id = ${id}
		`;
	} catch(err) {
		return {message: 'Database Error: Failed to Delete Invoice'};
	}
	
	//clear cache
	revalidatePath('/dashboard/invoices');
}