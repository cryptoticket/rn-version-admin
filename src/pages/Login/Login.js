import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

/**
 * Component renders a login page
 */
export default class Login extends React.Component {
	/**
	 * Renders JSX template
	 * @return {Object} JSX template
	 */
	render() {
		return (
			<div className="login">
				<Card className="login__card">
					<div>Username</div>
					<div className="p-inputgroup">
						<span className="p-inputgroup-addon">
							<i className="pi pi-user"></i>
						</span>
						<InputText />
					</div>
					<div className="mt-10">Password</div>
					<div className="p-inputgroup">
						<span className="p-inputgroup-addon">
							<i className="pi pi-lock"></i>
						</span>
						<Password feedback={false} />
					</div>
					<div className="p-inputgroup mt-10 p-justify-end">
						<Link to="/versions">
							<Button label="Login" icon="pi pi-lock-open" />
						</Link>
					</div>
				</Card>
			</div>
		);
	}
}
