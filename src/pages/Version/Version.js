import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import  { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import React from 'reactn';

import { api } from '../../lib';

/**
 * Component renders a page with versions
 */
export default class Version extends React.Component {
	// default state
	state = {
		bundles: [],
		isDeleteDialogVisible: false,
		isDialogVisible: false,
		latestBundleAndroid: {},
		latestBundleIos: {},
		paginationCurrentPage: 0,
		paginationItemsPerPage: 0,
		paginationTotalItemsCount: 0,
		selectedBundle: null
	};

	/**
	 * On component init
	 */
	async componentDidMount() {
		try {
			this.setGlobal({isLoading: true});
			const respBundles = await api.getBundles(this.state.paginationCurrentPage);
			const respLatestBundleAndroid = await api.getLatestBundle('android');
			const respLatestBundleIos = await api.getLatestBundle('ios');
			this.setState({
				bundles: respBundles.data,
				latestBundleAndroid: respLatestBundleAndroid.data,
				latestBundleIos: respLatestBundleIos.data,
				paginationItemsPerPage: +respBundles.headers['x-limit'],
				paginationTotalItemsCount: +respBundles.headers['x-total-count']
			});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on loading bundles'});
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
	 * Returns dialog footer
	 * @return {Object} JSX template
	 */
	getDialogFooter = () => {
		return (<div>
			<Button label="Save" icon="pi pi-check" onClick={this.onSaveClick} />
			<Button label="Cancel" icon="pi pi-times" onClick={() => this.setState({isDialogVisible: false})} className="p-button-secondary" />
		</div>);
	};

	/**
	 * On bundle delete
	 */
	onDelete = async () => {
		try {
			await api.deleteBundle(this.state.selectedBundle._id);
			this.setState({
				isDeleteDialogVisible: false,
				selectedBundle: null
			});
			await this.componentDidMount();
			this.global.growl.show({severity: 'success', summary: 'Success', detail: 'Bundle deleted'});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on deleting bundle'});
		}
	};

	/**
	 * On "delete" button click
	 * @param {Object} rowData model data
	 */
	onDeleteClick = (rowData) => {
		this.setState({
			isDeleteDialogVisible: true,
			selectedBundle: rowData
		});
	};

	/**
	 * On "edit" button press
	 * @param {Object} rowData model data
	 */
	onEditClick = (rowData) => {
		this.setState({
			isDialogVisible: true,
			selectedBundle: rowData
		});
	};

	/**
	 * On "save" button click in dialog
	 */
	onSaveClick = async () => {
		try {
			await api.updateBundle(this.state.selectedBundle);
			this.setState({
				isDialogVisible: false,
				selectedBundle: null
			});
			await this.componentDidMount();
			this.global.growl.show({severity: 'success', summary: 'Success', detail: 'Bundle updated'});
		} catch(err) {
			console.error(err);
			this.global.growl.show({severity: 'error', summary: 'Error', detail: 'Error on updating bundle'});
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
					<span>Android latest version: <strong>{Object.keys(this.state.latestBundleAndroid).length > 0 ? this.state.latestBundleAndroid.version : 'not available'}</strong></span>
				</Card>
				<Card>
					<span>iOS latest version: <strong>{Object.keys(this.state.latestBundleIos).length > 0 ? this.state.latestBundleIos.version : 'not available'}</strong></span>
				</Card>
				{/* versions table */}
				<Card>
					<h3>Versions</h3>
					<DataTable value={this.state.bundles}>
						<Column field="platform" header="Platform" />
						<Column field="version" header="Version" />
						<Column field="is_update_required" header="Is update required" body={(rowData) => String(rowData['is_update_required'])} />
						<Column field="storage" header="Storage type" />
						<Column field="desc" header="Description" />
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
					<Paginator 
						rows={this.state.paginationItemsPerPage} 
						totalRecords={this.state.paginationTotalItemsCount} 
						first={this.state.paginationItemsPerPage * this.state.paginationCurrentPage}
						onPageChange={(e) => this.setState({paginationCurrentPage: e.first / this.state.paginationItemsPerPage}, () => this.componentDidMount())} />
				</Card>
				{/* bundle dialog window */}
				{this.state.selectedBundle &&
					<Dialog header={`Updating ${this.state.selectedBundle.platform} bundle for version ${this.state.selectedBundle.version}`} style={{width: '30%'}} visible={this.state.isDialogVisible} footer={this.getDialogFooter()} onHide={() => this.setState({isDialogVisible: false})}>
						<div>
							<div>
								<div>
									Is update required
								</div>
								<div>
									<Dropdown 
										value={this.state.selectedBundle.is_update_required} 
										options={[{label: 'Yes', value: true}, {label: 'No', value: false}]} 
										onChange={(e) => this.setState({selectedBundle: {...this.state.selectedBundle, ...{is_update_required: e.target.value}}})} 
									/>
								</div>
							</div>
							<div>
								<div>
									Description
								</div>
								<div>
									<InputText 
										value={this.state.selectedBundle.desc} 
										onChange={(e) => this.setState({selectedBundle: {...this.state.selectedBundle, ...{desc: e.target.value}}})} 
									/>
								</div>
							</div>
						</div>
					</Dialog>
				}
				{/* delete dialog */}
				{this.state.isDeleteDialogVisible &&
					<Dialog header={'Deleting bundle'} style={{width: '30%'}} visible={this.state.isDeleteDialogVisible} footer={this.getDeleteDialogFooter()} onHide={() => this.setState({isDeleteDialogVisible: false})}>
						<div>
							Delete {this.state.selectedBundle.platform} bundle with version {this.state.selectedBundle.version} ?
						</div>
					</Dialog>
				}
			</div>
		);
	}
}
