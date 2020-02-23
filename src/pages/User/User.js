import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import  { InputText } from 'primereact/inputtext';
import React from 'reactn';
import validator from 'validator';

import { api } from '../../lib';

/**
 * Component renders a page with users
 */
export default class User extends React.Component {
	// default state
	state = {
		isDeleteDialogVisible: false,
		isUserDialogVisible: false,
		selectedUser: null,
		users: [],
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
	 * Returns delete dialog footer
	 * @return {Object} JSX template
	 */
	getDeleteDialogFooter = () => {
		return (<div>
			<Button label="Delete" icon="pi pi-trash" onClick={this.onDelete} className="p-button-danger" />
			<Button label="Cancel" icon="pi pi-times" onClick={() => this.setState({isDeleteDialogVisible: false})} className="p-button-secondary" />
		</div>);
	};

	/**
	 * Returns user dialog footer
	 * @return {Object} JSX template
	 */
	getUserDialogFooter = () => {
		return (<div>
			<Button label="Save" icon="pi pi-check" disabled={!validator.isEmail(this.state.selectedUser.email)} onClick={this.onSave} />
			<Button label="Cancel" icon="pi pi-times" onClick={() => this.setState({isUserDialogVisible: false})} className="p-button-secondary" />
		</div>);
	};

	/**
	 * On user delete
	 */
	onDelete = async () => {
		try {
			await api.deleteUser(this.state.selectedUser._id);
			this.setState({
				isDeleteDialogVisible: false,
				selectedUser: null
			});
			await this.componentDidMount();
			this.global.growl.show({severity: 'success', summary: 'Success', detail: 'User deleted'});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on deleting user'});
		}
	};

	/**
	 * On "delete" button click
	 * @param {Object} rowData model data
	 */
	onDeleteClick = (rowData) => {
		this.setState({
			isDeleteDialogVisible: true,
			selectedUser: rowData
		});
	};


	/**
	 * On "edit" button press
	 * @param {Object} rowData model data
	 */
	onEditClick = (rowData) => {
		this.setState({
			isUserDialogVisible: true,
			selectedUser: rowData
		});
	};

	/**
	 * On user save
	 */
	onSave = async () => {
		try {
			await api.updateUser(this.state.selectedUser);
			this.setState({
				isUserDialogVisible: false,
				selectedUser: null
			});
			await this.componentDidMount();
			this.global.growl.show({severity: 'success', summary: 'Success', detail: 'User updated'});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on updating user'});
		}
	};

	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {
		return (
			<div>
				{/* users table */}
				<Card>
					<h3>Users</h3>
					<DataTable value={this.state.users}>
						<Column field="email" header="Email" />
						<Column style={{overflowWrap: 'break-word'}} field="api_token" header="API token" />
						<Column field="created_at" header="Created at" />
						<Column field="updated_at" header="Updated at" />
						<Column body={(rowData) => (
							<React.Fragment>
								<span>
									<Button className="p-button-warning" label="Edit" icon="pi pi-pencil" onClick={() => this.onEditClick(rowData)} />
								</span>
								<span className="ml-5">
									<Button className="p-button-danger" label="Delete" icon="pi pi-trash" onClick={() => this.onDeleteClick(rowData)} />
								</span>
							</React.Fragment>
						)} />
					</DataTable>
				</Card>
				{/* bundle dialog window */}
				{this.state.isUserDialogVisible &&
					<Dialog header={`Updating user ${this.state.selectedUser.email}`} style={{width: '30%'}} visible={this.state.isUserDialogVisible} footer={this.getUserDialogFooter()} onHide={() => this.setState({isUserDialogVisible: false})}>
						<div>
							<div>
								<div>
									Email
								</div>
								<div>
									<InputText 
										value={this.state.selectedUser.email} 
										onChange={(e) => this.setState({selectedUser: {...this.state.selectedUser, ...{email: e.target.value}}})} 
									/>
								</div>
							</div>
						</div>
					</Dialog>
				}
				{/* delete dialog */}
				{this.state.isDeleteDialogVisible &&
					<Dialog header={'Deleting user'} style={{width: '30%'}} visible={this.state.isDeleteDialogVisible} footer={this.getDeleteDialogFooter()} onHide={() => this.setState({isDeleteDialogVisible: false})}>
						<div>
							Delete user {this.state.selectedUser.email} ?
						</div>
					</Dialog>
				}
			</div>
		);
	}
};
