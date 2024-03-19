import Search from '@/app/ui/search';
import Table from '@/app/ui/customers/table';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Customers'
};

export default async function Page({ 
	searchParams,
}: {
	searchParams?:{
		query?: string; 
		page?: string;
	};
}) {

	const query = searchParams?.query || '';
	const currentPage = Number(searchParams?.page) || 1;
	const customers = await fetchFilteredCustomers(query);

	return (
		<Suspense fallback={<InvoicesTableSkeleton />}>
			<Table customers={customers} />
		</Suspense>
	);
}