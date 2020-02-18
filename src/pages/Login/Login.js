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
		// redirect to google oauth page
		window.location.href = '/api/v1/auth/google';
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
