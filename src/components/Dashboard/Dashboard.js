import { Button } from 'primereact/button';
import { Growl } from 'primereact/growl';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toolbar } from 'primereact/toolbar';
import React, { setGlobal } from 'reactn';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { Login, User, Version } from '../../pages';
import './Dashboard.css';

// set an initial global state
setGlobal({
	growl: null,
	isLoading: false,
	redirect: null,
	user: null
});

/**
 * Component renders a dashboard with top menu and navigation
 */
export default class Dashboard extends React.Component {
	/**
	 * On component init
	 */
	componentDidMount() {
		// if oauth token was passed then save it to local storage
		const queryParams = new URLSearchParams(window.location.search);
		const queryToken = queryParams.get('token');
		// if token exists then save it and reload page without token so that axios lib could be reinitialized and could use this new token
		if(queryToken) {
			localStorage.setItem('token', queryToken);
			window.location.href = window.location.origin;
			return;
		} 
		// if token exists in local storage
		const localToken = localStorage.getItem('token');
		if(localToken) {
			// pass token to global state and redirect user to versions page
			this.setGlobal({ 
				redirect: '/versions',
				user: { token: localToken }
			});
		} else {
			// user is not authorized, redirect him to login page
			this.setGlobal({ 
				redirect: '/'
			});
		}
	};

	/**
	 * On "logout" button click
	 */
	onLogoutClick = () => {
		// delete token from local storage
		localStorage.removeItem('token');
		// clear user from global state and redirect user to login page
		this.setGlobal({ 
			redirect: '/',
			user: null
		});
	};

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
							{/* show top menu only to authorized user */}
							{this.global.user && 
								<div className="p-toolbar-group-right">
									<Link to="/users">
										<Button label="Users" icon="pi pi-users" className="p-button-secondary" />
									</Link>
									<Link to="/versions">
										<Button label="Versions" icon="pi pi-cloud" className="p-button-secondary" />
									</Link>
									<Button label="Logout" icon="pi pi-power-off" className="p-button-secondary" onClick={this.onLogoutClick} />
								</div>
							}
						</Toolbar>
					</div>
					{/* main content */}
					<div className="p-grid content">
						<div className="p-col-12">
						<Switch>
							<Route path="/users">
								<User />
							</Route>
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
				{/* app global redirect */}
				{ this.global.redirect && <Redirect to={this.global.redirect} /> }
				{/* app global loader */}
				{ this.global.isLoading && 
					<div className="app__global-loader">
						<ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" />
					</div>
				}
				{/* app global notification message */}
				<Growl ref={(el) => { this.setGlobal({growl: el}) }} />
			</Router>
		);
	}
}
