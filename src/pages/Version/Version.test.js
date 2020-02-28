import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'reactn';
import renderer from 'react-test-renderer';

import { api } from '../../lib';
import Version from './Version';

configure({ adapter: new Adapter() });

describe('Version component', () => {
    describe('componentDidMount()', () => {
		it('should load bundles', async () => {
			const bundles = [
				{
					platform: 'android',
					version: '1.0.0',
					is_update_required: false,
					storage: 'file',
					desc: 'desc',
					created_at: 1,
					updated_at: 2
				},
				{
					platform: 'ios',
					version: '1.0.0',
					is_update_required: false,
					storage: 'file',
					desc: 'desc',
					created_at: 1,
					updated_at: 2
				}
			];
			api.getBundles = jest.fn().mockReturnValue({
				headers: {
					'x-limit': 20,
					'x-total-count': 2
				},
				data: bundles
			});
			api.getLatestBundle = jest.fn((platform) => {
				return platform === 'android' ? { data: bundles[0] } : { data: bundles[1] };
			});
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.setGlobal = jest.fn();
			await instance.componentDidMount();
			expect(instance.setGlobal).toHaveBeenCalledWith({isLoading: true});
			expect(api.getBundles).toHaveBeenCalled();
			expect(api.getLatestBundle).toHaveBeenCalledWith('android');
			expect(api.getLatestBundle).toHaveBeenCalledWith('ios');
			expect(instance.state.bundles).toEqual(bundles);
			expect(instance.state.latestBundleAndroid).toEqual(bundles[0]);
			expect(instance.state.latestBundleIos).toEqual(bundles[1]);
			expect(instance.state.paginationItemsPerPage).toEqual(20);
			expect(instance.state.paginationTotalItemsCount).toEqual(2);
			expect(instance.setGlobal).toHaveBeenCalledWith({isLoading: false});
		});

		it('should throw on api error', async () => {
			api.getBundles = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.componentDidMount();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'error', summary: 'Error', detail: 'Error on loading bundles'});
		});
	});

	describe('getDeleteDialogFooter()', () => {
		it('should render delete dialog footer', function () {
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			const component = renderer.create(instance.getDeleteDialogFooter());
			expect(component.toJSON()).toMatchSnapshot();
		});
	});

	describe('getDialogFooter()', () => {
		it('should render user dialog footer', function () {
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			const component = renderer.create(instance.getDialogFooter());
			expect(component.toJSON()).toMatchSnapshot();
		});
	});

	describe('onDelete()', () => {
		it('should delete bundle', async () => {
			api.deleteBundle = jest.fn();
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.setState({
				selectedBundle: {
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
			expect(api.deleteBundle).toHaveBeenCalled();
			expect(instance.state.isDeleteDialogVisible).toEqual(false);
			expect(instance.state.selectedBundle).toEqual(null);
			expect(instance.componentDidMount).toHaveBeenCalled();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'success', summary: 'Success', detail: 'Bundle deleted'});
		});

		it('should throw on delete bundle error', async () => {
			api.deleteBundle = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.setState({
				selectedBundle: {
					_id: 1
				}
			});
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onDelete();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'error', summary: 'Error', detail: 'Error on deleting bundle'});
		});
	});

	describe('onDeleteClick()', () => {
		it('should show delete dialog', () => {
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.onDeleteClick({id: 1});
			expect(instance.state.isDeleteDialogVisible).toEqual(true);
			expect(instance.state.selectedBundle).toEqual({id: 1});
		});
	});

	describe('onEditClick()', () => {
		it('should show edit dialog', () => {
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.onEditClick({id: 1});
			expect(instance.state.isDialogVisible).toEqual(true);
			expect(instance.state.selectedBundle).toEqual({id: 1});
		});
	});

	describe('onSaveClick()', () => {
		it('should update bundle', async () => {
			api.updateBundle = jest.fn();
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.componentDidMount = jest.fn();
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onSaveClick();
			expect(api.updateBundle).toHaveBeenCalled();
			expect(instance.state.isDialogVisible).toEqual(false);
			expect(instance.state.selectedBundle).toEqual(null);
			expect(instance.componentDidMount).toHaveBeenCalled();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'success', summary: 'Success', detail: 'Bundle updated'});
		});

		it('should throw on bundle update API error', async () => {
			api.updateBundle = () => {
				return Promise.reject('expected test error');
			};
			const wrapper = shallow(<Version />);
			const instance = wrapper.instance();
			instance.setGlobal({
				growl: {
					show: jest.fn()
				}
			});
			await instance.onSaveClick();
			expect(instance.global.growl.show).toHaveBeenCalledWith({severity: 'error', summary: 'Error', detail: 'Error on updating bundle'});
		});
	});

	describe('render()', () => {
		it('should render component', function () {
			const component = renderer.create(<Version />);
			expect(component.toJSON()).toMatchSnapshot();
		});
	});
});
