import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import  {InputText } from 'primereact/inputtext';
import React from 'reactn';

import { api } from '../../lib';

/**
 * Component renders a page with versions
 */
export default class Version extends React.Component {
	// default state
	state = {
		bundles: [],
		isDialogVisible: false,
		selectedBundle: null
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
									<Button className="p-button-danger" label="Delete" icon="pi pi-trash" />
								</span>
							</React.Fragment>
						)} />
					</DataTable>
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
			</div>
		);
	}
}
