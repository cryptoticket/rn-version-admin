import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React from 'reactn';

import { api } from '../../lib';

/**
 * Component renders a page with users
 */
export default class User extends React.Component {
	// default state
	state = {
		users: []
	};

	/**
	 * On component init
	 */
	async componentDidMount() {
		try {
			this.setGlobal({isLoading: true});
			const resp = await api.getUsers(0);
			this.setState({users: resp.data});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on loading users'});
		} finally {
			this.setGlobal({isLoading: false});
		}
	};

	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {
		return (
			<div>
				<Card>
					<h3>Users</h3>
					<DataTable value={this.state.users}>
						<Column field="email" header="Email" />
						<Column field="api_token" header="API token" />
						<Column field="created_at" header="Created at" />
						<Column field="updated_at" header="Updated at" />
					</DataTable>
				</Card>
			</div>
		);
	}
};
