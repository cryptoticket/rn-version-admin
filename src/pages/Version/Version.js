import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React from 'reactn';

import { api } from '../../lib';

/**
 * Component renders a page with versions
 */
export default class Version extends React.Component {
	// default state
	state = {
		bundles: []
	};

	/**
	 * On component init
	 */
	async componentDidMount() {
		try {
			this.setGlobal({isLoading: true});
			const resp = await api.getBundles(0);
			this.setState({bundles: resp.data});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on loading bundles'});
		} finally {
			this.setGlobal({isLoading: false});
		}
	};

	/**
	 * Returns column template for field "is_update_required"
	 * @param {Object} rowData model data
	 * @param {Object} column column params
	 * @return {Object} JSX template
	 */
	getTemplateFieldIsUpdateRequired = (rowData, column) => {
        return String(rowData['is_update_required'])
    }

	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {
		return (
			<div>
				<Card>
					<h3>Versions</h3>
					<DataTable value={this.state.bundles}>
						<Column field="platform" header="Platform" />
						<Column field="version" header="Version" />
						<Column field="is_update_required" header="Is update required" body={this.getTemplateFieldIsUpdateRequired} />
						<Column field="storage" header="Storage type" />
						<Column field="desc" header="Description" />
						<Column field="created_at" header="Created at" />
						<Column field="updated_at" header="Updated at" />
					</DataTable>
				</Card>
			</div>
		);
	}
}
