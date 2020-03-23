import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import renderer from 'react-test-renderer';

import Login from './Login';

configure({ adapter: new Adapter() });

describe('Login component', () => {
    describe('onLoginClick()', () => {
		beforeEach(() => {
			delete process.env['REACT_APP_OAUTH_GATE_URL'];
		});

		it('should redirect user to 3rd party gate auth page', function () {
			delete window.location;
			window.location = {};
			const wrapper = shallow(<Login />);
			const instance = wrapper.instance();
			process.env['REACT_APP_OAUTH_GATE_URL'] = 'https://auth-service.com';
			instance.onLoginClick();
			expect(window.location.href).toEqual('https://auth-service.com');
		});

		it('should redirect user to google auth page', function () {
			delete window.location;
			window.location = {};
			const wrapper = shallow(<Login />);
			const instance = wrapper.instance();
			instance.onLoginClick();
			expect(window.location.href).toEqual('/api/v1/auth/google');
		});
	});

	describe('render()', () => {
		it('should render component', function () {
			const component = renderer.create(<Login />);
			expect(component.toJSON()).toMatchSnapshot();
		});
	});
});
