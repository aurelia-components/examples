import {Container} from 'aurelia-framework';
import {initialize} from 'aurelia-pal-browser';
import {BooleanColumn} from "../../../src/features/elements/grid/column/boolean-column";
import {DateColumn} from "../../../src/features/elements/grid/column/date-column";
import {InputColumn} from "../../../src/features/elements/grid/column/input-column";
import {SelectColumn} from "../../../src/features/elements/grid/column/select-column";
import {Grid} from "../mocks/fake-dependencies";
import {DataFeeder} from "../mocks/data-feeder";
import moment from 'moment';


initialize();

describe('testing columns sorting :', () =>{

	let container, grid, feeder;
	beforeEach(() => {
		container = new Container(),
		feeder = container.get(DataFeeder),
		grid = container.get(Grid);
		spyOn(grid, 'changeSort');
	});

	it('should sort boolean column asc/desc', done => {
		let column = new BooleanColumn({field: 'isActive'}, '', grid, 0);
		let sortedData = [false, false, true, false, true, true, false, true].sort((a, b) =>  column.compare(a, b));
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeFalsy();
		assertIfSorted(sortedData, true);
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeTruthy();
		expect(grid.changeSort.calls.any()).toBeTruthy();
		sortedData = sortedData.sort((a, b) =>  column.compare(a, b));
		assertIfSorted(sortedData);
		done();
	});

	it('should sort date column asc/desc', done => {
		let column = new DateColumn({field: 'someDate', from: new Date(2015, 12, 30),  to: new Date(2016, 2, 28)}, '', grid, 0);
		let sortedData = [moment(new Date(2016, 2, 28)), moment(new Date(2015, 12, 30)), moment(new Date(2016, 8, 13)),
		moment(new Date(2016, 4, 27)), moment(new Date(2016, 1, 7)), moment(new Date(2016, 10, 4)),
		moment(new Date(2016, 3, 12)), moment(new Date(2016, 4, 22)), moment(new Date(2016, 6, 1))].sort((a, b) =>  column.compare(a, b));
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeFalsy();
		assertIfSorted(sortedData, true);
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeTruthy();
		expect(grid.changeSort.calls.any()).toBeTruthy();
		sortedData = sortedData.sort((a, b) => column.compare(a, b));
		assertIfSorted(sortedData);
		done();
	});

	it('should sort input column asc/desc', done => {
		let column = new InputColumn({field: 'name'}, '', grid, 0);
		var unsorted = [];

		for(var i = 0; i < 20; i++){
			unsorted.push(feeder.getRandomString(10));
		}

		let sortedData = unsorted.sort((a, b) =>  column.compare(a, b));
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeFalsy();
		assertIfSorted(sortedData, true);
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeTruthy();
		expect(grid.changeSort.calls.any()).toBeTruthy();
		sortedData = sortedData.sort((a, b) => column.compare(a, b));
		assertIfSorted(sortedData);
		done();
	});

	it('should sort select column asc/desc', done => {
		let column = new SelectColumn({field: 'someOption', 'filter-items.bind': ''}, '', grid, 0);
		var unsorted = [];

		for(var i = 0; i < 20; i++){
			unsorted.push(feeder.getRandom(400));
		}

		let sortedData = unsorted.sort((a, b) =>  column.compare(a, b));
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeFalsy();
		assertIfSorted(sortedData, true);
		column.changeDirectionSort();
		expect(column.isSortDirectionDesc()).toBeTruthy();
		expect(grid.changeSort.calls.any()).toBeTruthy();
		sortedData = sortedData.sort((a, b) => column.compare(a, b));
		assertIfSorted(sortedData);
		done();
		
	});

});

function assertIfSorted(collection, asc){
	for(var i = 1; i < collection.length; i ++){
		if(asc){
			expect(collection[i -1] <= collection[i]).toBeTruthy();
		}else{
			expect(collection[i -1] >= collection[i]).toBeTruthy();
		}
	}
}