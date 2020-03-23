import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React from 'react';
import './Login.css';

/**
 * Component renders a login page
 */
export default class Login extends React.Component {

	/**
	 * On button "login" click
	 */
	onLoginClick = () => {
		// if gate (3rd party oauth service) url is set then redirect to gate
		if(process.env['REACT_APP_OAUTH_GATE_URL']) {
			window.location.href = process.env['REACT_APP_OAUTH_GATE_URL'];
		} else {
			// redirect to google oauth by default
			window.location.href = '/api/v1/auth/google';
		}
	};

	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {
		return (
			<div className="login">
				<Card className="login__card">
					<div className="p-inputgroup p-justify-center">
						<Button label="Login with Google" icon="pi pi-google" onClick={this.onLoginClick} />
					</div>
				</Card>
			</div>
		);
	}
}
