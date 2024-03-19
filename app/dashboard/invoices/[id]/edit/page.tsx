import Form from '@/app/ui/invoices/edit-form';
import BreadCrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Edit Invoice'
};


export default async function Page({ params }: { params: {id:string}}){
	//get id, specified invoice, and customers
	const id = params.id;
	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(id),
		fetchCustomers()
	]);
	
	if(!invoice){
		notFound();
	}
	
	return(
		<main>
			<BreadCrumbs 
				breadcrumbs={[
					{ label: 'Invoices', href: '/dashboard/invoices' },
					{
					  label: 'Edit Invoice',
					  href: `/dashboard/invoices/${id}/edit`,
					  active: true,
					},
				]}
			/>
			<Form invoice={invoice} customers={customers} />
		</main>
	);
}