/*global describe, it, expect, BugMagnet, beforeEach, jasmine, spyOn*/
describe('BugMagnet.processConfigText', function () {
	'use strict';
	var menuBuilder;
	beforeEach(function () {
		menuBuilder = jasmine.createSpyObj('menuBuilder', ['rootMenu', 'subMenu', 'menuItem']);
	});
	it('creates a root level menu titled Bug Magnet if root menu is not provided', function () {
		BugMagnet.processConfigText('{}', menuBuilder);
		expect(menuBuilder.rootMenu).toHaveBeenCalledWith('Bug Magnet');
	});
	it('returns the root menu id', function () {
		menuBuilder.rootMenu.and.returnValue('rootM');
		var result = BugMagnet.processConfigText('{}', menuBuilder);
		expect(result).toEqual('rootM');
	});
	it('does not create a root menu, but uses the one from the argument if provided', function () {
		BugMagnet.processConfigText('{"First Item": { "_type": "taxtype", "amount": "200" }}', menuBuilder, 'customRoot');
		expect(menuBuilder.rootMenu).not.toHaveBeenCalled();
		expect(menuBuilder.menuItem.calls.count()).toBe(1);
		expect(menuBuilder.menuItem.calls.argsFor(0)).toEqual(['First Item', 'customRoot', {'_type': 'taxtype', 'amount': '200'}]);
	});
	it('calls the processMenuObject to run through the JSON-parsed object', function () {
		spyOn(BugMagnet, 'processMenuObject');
		BugMagnet.processConfigText('{"First Item": { "_type": "taxtype", "amount": "200" }}', menuBuilder, 'customRoot');
		expect(BugMagnet.processMenuObject).toHaveBeenCalledWith({'First Item': { '_type': 'taxtype', 'amount': '200' }}, menuBuilder, 'customRoot');
	});
});
describe('BugMagnet.processMenuObject', function () {
	'use strict';
	var rootMenu, menuBuilder;
	beforeEach(function () {
		rootMenu = 'rootM';
		menuBuilder = jasmine.createSpyObj('menuBuilder', ['rootMenu', 'subMenu', 'menuItem']);
	});
	it('creates simple menu items out of string-value properties, in order of appearance', function () {
		BugMagnet.processMenuObject({'First Item': 'VAT', 'Second Item': 'Corporate Tax', 'Another Item': 'Euro VAT'}, menuBuilder, rootMenu);
		expect(menuBuilder.menuItem.calls.count()).toBe(3);
		expect(menuBuilder.menuItem.calls.argsFor(0)).toEqual(['First Item', 'rootM', 'VAT']);
		expect(menuBuilder.menuItem.calls.argsFor(1)).toEqual(['Second Item', 'rootM', 'Corporate Tax']);
		expect(menuBuilder.menuItem.calls.argsFor(2)).toEqual(['Another Item', 'rootM', 'Euro VAT']);
	});
	it('creates simple menu items out of objects with _type property, passing the object into the menu as value', function () {
		BugMagnet.processMenuObject({'First Item': { '_type': 'taxtype', 'amount': '200' }}, menuBuilder, rootMenu);
		expect(menuBuilder.menuItem.calls.count()).toBe(1);
		expect(menuBuilder.menuItem.calls.argsFor(0)).toEqual(['First Item', 'rootM', {'_type': 'taxtype', 'amount': '200'}]);
	});
	it('creates sub-menus out of string array items, using name as label, in array index order', function () {
		menuBuilder.subMenu.and.returnValue('subM');
		BugMagnet.processMenuObject({'Taxes': ['VAT', 'Corporate Tax', 'Euro VAT']}, menuBuilder, rootMenu);

		expect(menuBuilder.subMenu).toHaveBeenCalledWith('Taxes', 'rootM');
		expect(menuBuilder.menuItem.calls.count()).toBe(3);
		expect(menuBuilder.menuItem.calls.argsFor(0)).toEqual(['VAT', 'subM', 'VAT']);
		expect(menuBuilder.menuItem.calls.argsFor(1)).toEqual(['Corporate Tax', 'subM', 'Corporate Tax']);
		expect(menuBuilder.menuItem.calls.argsFor(2)).toEqual(['Euro VAT', 'subM', 'Euro VAT']);
	});
	it('creates sub-menus out of hash items', function () {
		menuBuilder.subMenu.and.returnValue('subM');
		BugMagnet.processMenuObject({'Taxes': {'First Item': 'VAT', 'Second Item': 'Corporate Tax', 'Another Item': 'Euro VAT'}}, menuBuilder, rootMenu);

		expect(menuBuilder.subMenu).toHaveBeenCalledWith('Taxes', 'rootM');
		expect(menuBuilder.menuItem.calls.count()).toBe(3);
		expect(menuBuilder.menuItem.calls.argsFor(0)).toEqual(['First Item', 'subM', 'VAT']);
		expect(menuBuilder.menuItem.calls.argsFor(1)).toEqual(['Second Item', 'subM', 'Corporate Tax']);
		expect(menuBuilder.menuItem.calls.argsFor(2)).toEqual(['Another Item', 'subM', 'Euro VAT']);
	});
});

