import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Login, Version } from '../../pages';
import './Dashboard.css';

/**
 * Component renders a dashboard with top menu and navigation
 */
export default class Dashboard extends React.Component {
	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {
		return (
			<Router>
				<div className="p-5">
					{/* toolbar */}
					<div>
						<Toolbar>
							<div className="p-toolbar-group-left">
								<strong>React Native Version Admin</strong>
							</div>
							<div className="p-toolbar-group-right">
								<Link to="/versions">
									<Button label="Versions" icon="pi pi-cloud" className="p-button-secondary" />
								</Link>
								<Link to="/">
									<Button label="Logout" icon="pi pi-power-off" className="p-button-secondary" />
								</Link>
							</div>
						</Toolbar>
					</div>
					{/* main content */}
					<div className="p-grid content">
						<div className="p-col-12">
						<Switch>
							<Route path="/versions">
								<Version />
							</Route>
							<Route path="/">
								<Login />
							</Route>
						</Switch>
						</div>
					</div>
				</div>
			</Router>
		);
	}
}
