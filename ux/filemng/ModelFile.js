/*
 * Ext JS Library 4.1 File Manager
 * Copyright(c) 2011 Sergey Voronkov.
 * http://www.softcoder.ru
 */
Ext.define('Ext.ux.filemng.ModelFile', {
	extend: 'Ext.data.Model',
	idProperty:'id',
	fields:[
		{name:'id',type:'string'},
		{name:'path',type:'string'},
		{name:'name',type:'string'},
		{name:'preview',type:'string'},
		{name:'type',type:'string'},
		{name:'cls',type:'string'},
		{name:'action',type:'string'},
		{name:'state'},
		{name:'size', type: 'float', defaultValue:0},
		{name:'lastmod', type:'date', dateFormat:'timestamp'},
		{name:'attributes'},
		'width',
		'height'
	]
});


