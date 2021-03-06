import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import renderer from 'react-test-renderer';

import Dashboard from './Dashboard';

configure({ adapter: new Adapter() });

describe('Dashboard component', () => {
    describe('componentDidMount()', () => {
		it('should set auth token and reload page if token exists', function () {
			delete window.location;
			window.location = {
				search: '?token=ANY_TOKEN',
				origin: 'https://site.com'
			};
			const spyLocalStorageSetItem = jest.spyOn(Storage.prototype, 'setItem');
			const wrapper = shallow(<Dashboard />);
			const instance = wrapper.instance();
			instance.setGlobal = jest.fn();
			instance.componentDidMount();
			expect(spyLocalStorageSetItem).toHaveBeenCalled();
			expect(window.location.href).toEqual('https://site.com');
			// remove created token from local storage
			localStorage.removeItem('token');
		});

		it('should redirect user to versions page if token is already saved', function () {
			delete window.location;
			window.location = {
				search: ''
			};
			const spyLocalStorageGetItem = jest.spyOn(Storage.prototype, 'getItem');
			localStorage.setItem('token', 'ANY_TOKEN');
			const wrapper = shallow(<Dashboard />);
			const instance = wrapper.instance();
			instance.setGlobal = jest.fn();
			instance.componentDidMount();
			expect(spyLocalStorageGetItem).toHaveBeenCalled();
			expect(instance.setGlobal).toHaveBeenCalledWith({
				redirect: '/versions',
				user: { token: 'ANY_TOKEN' }
			});
			// remove created token from local storage
			localStorage.removeItem('token');
		});
		
		it('should redirect to login page if token does not exist', function () {
			const wrapper = shallow(<Dashboard />);
			const instance = wrapper.instance();
			instance.setGlobal = jest.fn();
			instance.componentDidMount();
			expect(instance.setGlobal).toHaveBeenCalledWith({
				redirect: '/'
			});
        });
	});

	describe('onLogoutClick()', () => {
		it('should delete auth token and redirect user to login page', function () {
			const spyLocalStorageRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
			const wrapper = shallow(<Dashboard />);
			const instance = wrapper.instance();
			instance.setGlobal = jest.fn();
			instance.onLogoutClick();
			expect(spyLocalStorageRemoveItem).toHaveBeenCalled();
			expect(instance.setGlobal).toHaveBeenCalledWith({
				redirect: '/',
				user: null
			});
		});
	});

	describe('render()', () => {
		it('should render component', function () {
			localStorage.setItem('token', 'ANY_TOKEN');
			const component = renderer.create(<Dashboard global={{user: {id: 1}, redirect: '/any', isLoading: true}} />);
			expect(component.toJSON()).toMatchSnapshot();
			localStorage.removeItem('token');
		});
	});
});
