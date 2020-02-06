import { Card } from 'primereact/card';
import { Column, DataTable } from 'primereact/datatable';
import React from 'react';

/**
 * Component renders a page with versions
 */
export default class Version extends React.Component {
	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {

		const data = [
			{
				platform: 'android',
				created_at: 1,
				storage_type: 'file',
				version: '1.0.0',
				is_update_requied: false
			},
			{
				platform: 'android',
				created_at: 1,
				storage_type: 'file',
				version: '1.0.0',
				is_update_requied: false
			}
		];

		return (
			<div>
				<Card>
					<h3>Versions</h3>
					<DataTable value={data}>
						<Column field="platform" header="Platform" />
						<Column field="created_at" header="Created at" />
						<Column field="storage_type" header="Storage type" />
						<Column field="version" header="Version" />
						<Column field="is_update_requied" header="Is update required" />
					</DataTable>
				</Card>
			</div>
		);
	}
}
