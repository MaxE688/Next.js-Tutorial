import Form from '@/app/ui/invoices/edit-form';
import BreadCrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';


export default async function Page({ params }: { params: {id:string}}){
	//const customers = await fetchCustomers();
	const id = params.id;
	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(id),
		fetchCustomers()
	]);
	
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