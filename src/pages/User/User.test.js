import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'reactn';
import renderer from 'react-test-renderer';

import { api } from '../../lib';
import User from './User';

configure({ adapter: new Adapter() });

describe('User component', () => {
    describe('componentDidMount()', () => {
		it('should load users', async () => {
			const users = [{
				email: 'user1@mail.com',
				api_token: 'token1',
				created_at: 1,
				updated_at: 2
			}];
			api.getUsers = jest.fn().mockReturnValue({
				headers: {
					'x-limit': 20,
					'x-total-count': 1
				},
				data: users
			});
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setGlobal = jest.fn();
			await instance.componentDidMount();
			expect(instance.setGlobal).toHaveBeenCalledWith({isLoading: true});
			expect(instance.state.paginationItemsPerPage).toEqual(20);
			expect(instance.state.paginationTotalItemsCount).toEqual(1);
			expect(instance.state.users).toEqual(users);
			expect(instance.setGlobal).toHaveBeenCalledWith({isLoading: false});
		});

		it('should throw on api error', async () => {
			api.getUsers = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.componentDidMount();
			expect(instance.global.growl.show).toHaveBeenCalled();
		});
	});

	describe('getDeleteDialogFooter()', () => {
		it('should render delete dialog footer', function () {
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			const component = renderer.create(instance.getDeleteDialogFooter());
			expect(component.toJSON()).toMatchSnapshot();
		});
	});

	describe('getUserDialogFooter()', () => {
		it('should render user dialog footer', function () {
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				selectedUser: {
					email: ''
				}
			});
			const component = renderer.create(instance.getUserDialogFooter());
			expect(component.toJSON()).toMatchSnapshot();
		});
	});

	describe('onCreateClick()', () => {
		it('should show user dialog', () => {
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.onCreateClick();
			expect(instance.state.isNewUser).toEqual(true);
			expect(instance.state.isUserDialogVisible).toEqual(true);
			expect(instance.state.selectedUser).toEqual({email: ''});
		});
	});

	describe('onDelete()', () => {
		it('should delete user', async () => {
			api.deleteUser = jest.fn();
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				selectedUser: {
					_id: 1
				}
			});
			instance.componentDidMount = jest.fn();
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onDelete();
			expect(api.deleteUser).toHaveBeenCalled();
			expect(instance.state.isDeleteDialogVisible).toEqual(false);
			expect(instance.state.selectedUser).toEqual(null);
			expect(instance.componentDidMount).toHaveBeenCalled();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'success', summary: 'Success', detail: 'User deleted'});
		});

		it('should throw on delete user error', async () => {
			api.deleteUser = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				selectedUser: {
					_id: 1
				}
			});
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onDelete();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'error', summary: 'Error', detail: 'Error on deleting user'});
		});
	});

	describe('onDeleteClick()', () => {
		it('should show delete dialog', () => {
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.onDeleteClick({id: 1});
			expect(instance.state.isDeleteDialogVisible).toEqual(true);
			expect(instance.state.selectedUser).toEqual({id: 1});
		});
	});

	describe('onEditClick()', () => {
		it('should show edit dialog', () => {
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.onEditClick({email: ''});
			expect(instance.state.isNewUser).toEqual(false);
			expect(instance.state.isUserDialogVisible).toEqual(true);
			expect(instance.state.selectedUser).toEqual({email: ''});
		});
	});

	describe('onSave()', () => {
		it('should create a new user', async () => {
			api.createUser = jest.fn();
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				isNewUser: true
			});
			instance.componentDidMount = jest.fn();
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onSave();
			expect(api.createUser).toHaveBeenCalled();
			expect(instance.state.isUserDialogVisible).toEqual(false);
			expect(instance.state.selectedUser).toEqual(null);
			expect(instance.componentDidMount).toHaveBeenCalled();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'success', summary: 'Success', detail: 'User created'});
		});

		it('should update user', async () => {
			api.updateUser = jest.fn();
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				isNewUser: false
			});
			await instance.onSave();
			expect(api.updateUser).toHaveBeenCalled();
		});

		it('should throw on user creation API error', async () => {
			api.createUser = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				isNewUser: true
			});
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onSave();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'error', summary: 'Error', detail: 'Error on creating user'});
		});

		it('should throw on user update API error', async () => {
			api.updateUser = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<User />);
			const instance = wrapper.instance();
			instance.setState({
				isNewUser: false
			});
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onSave();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'error', summary: 'Error', detail: 'Error on updating user'});
		});
	});

	describe('render()', () => {
		it('should render component', function () {
			const component = renderer.create(<User />);
			expect(component.toJSON()).toMatchSnapshot();
		});
	});
});
