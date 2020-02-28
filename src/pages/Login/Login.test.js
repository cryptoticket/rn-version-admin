import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import renderer from 'react-test-renderer';

import Login from './Login';

configure({ adapter: new Adapter() });

describe('Login component', () => {
    describe('onLoginClick()', () => {
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
