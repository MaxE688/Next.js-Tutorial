'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

//schema for form data to update DB
const FormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: 'Please select a customer',
	}),
	amount: z.coerce
		.number()
		.gt(0, { message: 'Please enter an amount greater than $0' }),
	status: z.enum(['pending', 'paid'], {
		invalid_type_error: 'Please select an invoice status'
	}),
	date: z.string(),
});

//form data validation
const CreateInvoice = FormSchema.omit({id: true, date:true});
const UpdateInvoice = FormSchema.omit({id: true, date:true});

export type State = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
	
	//validate formData using zod
	const validatedFields = CreateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});
	
	
	console.log(validatedFields);
	
	//If form validation fails return errors
	if(!validatedFields.success){
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing Fields. Failed to Create Invoice',
		};
	}
	
	
	//Prepares data for insertion into the database
	const { customerId, amount, status } = validatedFields.data;
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

export async function updateInvoice(id: string, prevState: State, formData: FormData){
	
	//validate formData
	const validatedFields = UpdateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});
	
	//If form validation fails return errors
	if(!validatedFields.success){
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing Fields. Failed to Update Invoice.',
		};
	}
	
	//prepares data for insertion to the database
	const { customerId, amount, status } = validatedFields.data
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

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}