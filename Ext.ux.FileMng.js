/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2011 Sergey Voronkov.
 * http://www.softcoder.ru
 */
Ext.ns('Ext.ux.filemng');
Ext.applyIf(Array.prototype, {
	filter:function(iterator, scope){
		var res = [];
		for(var i = 0, l = this.length; i < l; ++i)
		{
			if(iterator.call(scope || window, this[i],i,this)) res[res.length] = this[i];
		}
		return res;
	},
	map:function(iterator, scope){
		var res = [];
		for(var i = 0, l = this.length; i < l; ++i)
		{
			res[res.length] = iterator.call(scope || window, this[i],i,this);
		}
		return res;
	},
	forEach:function(iterator, scope){
		for(var i = 0, l = this.length; i < l; ++i)
		{
			iterator.call(scope || window, this[i],i,this);
		}
	}
});
(function(ns,lang){
ns.v = 'beta 0.01v.';
function t(text/*,...*/)
{
	if(lang && text in lang){
		text = lang[text];
	}
	for(var i =1,l = arguments.length;i <l;++i)
	{
		text = text.replace('{'+i+'}',arguments[i]);
	}
	return text;
}

function box(html){
	return '<div class="x-box"><div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div><div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc">'+html+'</div></div></div><div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div></div>'
}
ns.FileRecord = Ext.data.Record.create([
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
	{name:'attributes'},'width','height'
]);
function imageLoader(img){

	var loader = new Image;
	loader.src = img.src;
	var wrap = Ext.get(img).parent();
	if(wrap) wrap.addClass('doloading');
	(function(){
		if(loader.width == 0){
			if(wrap) {
				wrap.removeClass('doloading');
				wrap.addClass('loading');
			}
			Ext.get(loader).on('load',function(){
				img.src = loader.src;
				if(wrap) {
					wrap.removeClass('loading');
				}
				loader = null;
				wrap = null
			},this,{single:true});
		} else {
			loader = false;
		}
	}).defer(100);
}
function imagesLoader(block, q){
	if(Ext.isOpera == false){
		Ext.each(Ext.get(block).query(q || 'img'),imageLoader);
	}
}
/**
 * @class Ext.ux.fielmng.PathToolbar
 * @extends Ext.Toolbar
 * 
 * @xtype filemng
 */
ns.PathToolbar = Ext.extend(Ext.Toolbar,{
	initComponent:function(){
		this.items = [{
			tag:'div'
		}];
		ns.PathToolbar.superclass.initComponent.call(this);
	},
	onRender : function(ct, position){
		this.tpl = new Ext.XTemplate(
			'<div class="x-filemng-path"><a href="/" title="Root folder">file:</a> ',
			'<tpl for=".">',
				'<span>/</span><a href="{path}" title="{path}">{name}</a>',
			'</tpl>',
			'</div>'
		);
		ns.PathToolbar.superclass.onRender.call(this, ct, position);
		this.initEvent();
		this.setFolder(this.path || '');
	},
	initEvent:function()
	{
		this.el.on('click',this.onSelect,this,{delegate:'a'});
	},
	onSelect:function(e,t){
		e.stopEvent();
		this.fireEvent('select',this,decodeURIComponent(t.pathname));
		return false;
	},
	setFolder:function(path)
	{
		this.path = path;
		var p = '';
		if(this.el) {
			var data = [];
			var items = path.replace('\\','/').split('/');
			for(var i = 0,l=items.length;i<l;++i){
				var v = items[i];
				if(v){
					data.push({
						name:v,
						path: p+= '/' + v
					});
				}
			}
			this.tpl.overwrite(this.el,data);
		}
	}
});
var DragSelector = function(cfg){
	cfg = cfg || {};
	var view, proxy, tracker;
	var rs, bodyRegion, dragRegion = new Ext.lib.Region(0,0,0,0);
	var dragSafe = cfg.dragSafe === true;
	this.ptype = false;
	this.init = function(dataView){
		view = dataView;
		view.on('render', onRender);
	};

	function fillRegions(){
		rs = [];
		view.all.each(function(el){
			rs[rs.length] = el.getRegion();
		});
		bodyRegion = view.el.getRegion();
	}

	function cancelClick(){
		return false;
	}

	function onBeforeStart(e){
		return !dragSafe || e.target == view.el.dom;
	}

	function onStart(e){
		if(e.xy[0] < view.getTemplateTarget().getBox().right)
		{
			view.on('containerclick', cancelClick, view, {single:true});
			if(!proxy){
				proxy = view.el.createChild({cls:'x-view-selector'});
			}else{
				if(proxy.dom.parentNode !== view.el.dom){
					view.el.dom.appendChild(proxy.dom);
				}
				proxy.setDisplayed('block');
			}
			fillRegions();
			view.clearSelections();
		}
	}

	function onDrag(e){
		if(bodyRegion) {
			var startXY = tracker.startXY;
			var xy = tracker.getXY();

			var x = Math.min(startXY[0], xy[0]);
			var y = Math.min(startXY[1], xy[1]);
			var w = Math.abs(startXY[0] - xy[0]);
			var h = Math.abs(startXY[1] - xy[1]);

			dragRegion.left = x;
			dragRegion.top = y;
			dragRegion.right = x+w;
			dragRegion.bottom = y+h;

			dragRegion.constrainTo(bodyRegion);
			proxy.setRegion(dragRegion);

			for(var i = 0, len = rs.length; i < len; i++){
				var r = rs[i], sel = dragRegion.intersect(r);
				if(sel && !r.selected){
					r.selected = true;
					view.select(i, true);
				}else if(!sel && r.selected){
					r.selected = false;
					view.deselect(i);
				}
			}
		}
	}

	function onEnd(e){
		if (!Ext.isIE) {
			view.un('containerclick', cancelClick, view);    
		}        
		if(proxy){
			proxy.setDisplayed(false);
		}
	}

	function onRender(view){
		tracker = new Ext.dd.DragTracker({
			onBeforeStart: onBeforeStart,
			onStart: onStart,
			onDrag: onDrag,
			onEnd: onEnd,
			preventDefault :false
		});
		tracker.initEl(view.el);
	}
};
ns.ListView = Ext.extend(Ext.list.ListView,{
	typeView:'icon',
	loadingText:'Загрузка',
	columns: [{
		header: 'Название',
		width: 0.5,
		dataIndex: 'name',
		//tpl: '{name}<div class="contrl"><a class="b-download"></a><a class="b-del"></a></div>',
		cls:'file-name'
	},{
		header: 'Время изменения',
		xtype: 'datecolumn',
		format: 'd.m.Y h:i:s',
		width: 0.25, 
		dataIndex: 'lastmod'
	},{
		header: 'Размер',
		dataIndex: 'size',
		tpl: '<tpl if="size">{size:fileSize}</tpl>',
		align: 'right',
		cls: 'listview-filesize',
		width: 0.15
	},{
		header: 'Доступ',
		dataIndex: 'state',
		tpl: '<tpl if="values.state">{[values.state.perms.human]}</tpl>',
		cls: 'listview-perms',
		align: 'center'
	}],
	initComponent:function(){
		this.initTemplates();
		this.setTypeView(this.typeView);
		ns.ListView.superclass.initComponent.call(this);
	},
	onRender : function(){
		ns.ListView.superclass.onRender.apply(this, arguments);
		this.innerBody.addClass("x-filemng-view"+this.typeView);
		this.el.dom.tabIndex = 1;
	},
	refresh : function() {
		ns.ListView.superclass.refresh.call(this);
		imagesLoader(this.getTemplateTarget(),'div.type-image img');
	},
	onUp:function(e){
		
	},
	onDown:function(e){
		
	},
	setTypeView:function(type)
	{
		this.tpl = this.templates[type];
		if(this.typeView != type){
			this.typeView = type;
			this.refresh();
		}
	},
	//overClass:'x-view-over',
	itemSelector:'.file-item',
	initTemplates:function(){
		if(!this.internalTpl){
			this.internalTpl = new Ext.XTemplate(
				'<div class="x-list-header"><div class="x-list-header-inner">',
					'<tpl for="columns">',
					'<div style="width:{[values.width*100]}%;text-align:{align};"><em unselectable="on" id="',this.id, '-xlhd-{#}">',
						'{header}',
					'</em></div>',
					'</tpl>',
					'<div class="x-clear"></div>',
				'</div></div>',
				'<div class="x-list-body"><div class="x-list-body-inner">',
				'</div></div>',
				'<div class="x-clear"></div>'
			);
		}
		this.templates = {
			'list':new Ext.XTemplate(
				'<div  class="x-filemng-listview">',
				'<tpl for="rows">',
					'<dl class="file-item type-{type}<tpl if="values.action"> action-{action}</tpl>">',
						'<tpl for="parent.columns">',
						'<dt style="width:{[values.width*100]}%;text-align:{align};" id="{id}" >',
						'<em unselectable="on"<tpl if="cls"> class="{cls}"</tpl>>',
							'<tpl if="cls==\'file-name\'"><img src="'+Ext.BLANK_IMAGE_URL+'" alt="" class="file-icon file-icon-{parent.cls}"/></tpl>',
							'{[values.tpl.apply(parent)]}',
						'</em></dt>',
						'</tpl>',
						'<div class="x-clear"></div>',
					'</dl>',
				'</tpl>',
				'</div>'
			),
			'icon':new Ext.XTemplate(
				'<div  class="x-filemng-icon">',
				'<tpl for="rows">',
					'<div class="thumb-wrap file-item type-{type}<tpl if="values.action" id="{id}"> action-{action}</tpl>">',
						'<div class="thumb">',
							'<tpl if="type==\'image\'">',
								//'<img class="file-icon" src="'+this.baseUrl+'{preview}" title="{name}"/>',
								'<img class="file-icon" width="100" height="75" src="'+this.fileMng.action('files','preview')+'/{id}?width=100&height=75&mode=2" title="{name}"/>',
								'<div class="imgsize">{width}x{height}</div>',
								'<div class="wite"></div>',
							'</tpl>',
							'<tpl if="type!=\'image\'">',
								'<img class="file-icon" src="'+Ext.BLANK_IMAGE_URL+'" title="{name}"/>',
							'</tpl>',
						'</div>',
						'<span class="x-editable file-name">{name:ellipsis(15)}</span>',
					'</div>',
				'</tpl>',
				'<div class="x-clear"></div>',
				'</div>'
			)
		};
	},
	destroy : function(){
		Ext.grid.RowSelectionModel.superclass.destroy.call(this);
	} 
});
var FileUploader = Ext.extend(Ext.FormPanel,{
	fileUpload: true,
	autoHeight: true,
	bodyStyle: 'padding: 10px 10px 0 10px;background-color:transparent',
	labelWidth: 60,
	border:false,
	defaults: {
		anchor: '95%',
		allowBlank: false,
		msgTarget: 'side'
	},
	initComponent:function(){
		this.buttons = [{
			text:t('Загрузить'),
			handler:this.onSave,
			scope:this
		},{
			text:t('Закрыть'),
			handler:this.onClose,
			scope:this
		}];
		this.items = [{
			xtype:'textfield',
			name:'name',
			fieldLabel:t('Название')
		},{
			xtype: 'fileuploadfield',
			emptyText: t('Выберите файл для загрузки'),
			fieldLabel: t('Файл'),
			name: 'file',
			buttonCfg: {
				text: '',
				iconCls: 'b-upload-file'
			},
			listeners:{
				'fileselected':function(field,name){
					var field = this.getForm().findField('name');
					field.setValue(name.substr(name.replace((/\\/igm), '/').lastIndexOf('/')+1));
					field.selectText(0,name.lastIndexOf('.'));
				},
				scope:this
			}
		}]
		FileUploader.superclass.initComponent.call(this);
	},
	upload:function(){
		this.getForm().submit({
			url: this.fileMng.action('files','upload'),
			waitMsg: t('Загрузка...'),
			params:{
				dir:this.fileMng.getFolder()
			},
			success: function(fp, o){
				this.fileMng.onLoadData(o.result);
				this.onClose();
				this.getForm().reset();
			},
			failure: function(form, action) {
				switch (action.failureType) {
					case Ext.form.Action.CLIENT_INVALID:
						Ext.Msg.alert(t('Не удача'), t('Не верно заполнены поля'));
						break;
					case Ext.form.Action.CONNECT_FAILURE:
						Ext.Msg.alert(t('Не удача'), t('Не смог подключиться'));
						break;
					case Ext.form.Action.SERVER_INVALID:
					   Ext.Msg.alert(t('Не удача'), action.result.message);
				}
			},
			scope:this
		});
	},
	onSave:function(){
		if(this.getForm().isValid())
		{
			this.fileMng.fileExist(this.getForm().getValues().name,function(exist){
				if(exist){
					Ext.Msg.confirm(t('Загрузка'),t('Файл существует, заменить?'),function(b){
						if(b == 'yes'){
							//this.upload();
						}
					},this);
				} else {
					this.upload();
				}
			},this);
		}
	},
	
	onClose:function(){
		this.fileMng.exeCmd('upload_file_hide')
	}
});
var TreePanel = Ext.extend(Ext.tree.TreePanel,{
	autoScroll:true,
	useArrows: true,
	animate: true,
	containerScroll: true,
	border: false,
	split: true,
	rootVisible: false,
	root: {
		nodeType: 'async',
		text: 'root',
		draggable: false,
		id: '/'
	},
	selectPath : function(path, attr, callback){
		if(Ext.isEmpty(path)){
			if(callback){
				callback(false, undefined);
			}
			return;
		}
		attr = attr || 'id';
		
		var keys = path.split(this.pathSeparator).filter(function(v){return !!v;}),
			v = this.pathSeparator+keys.join(this.pathSeparator);
		keys.pop();
		if(keys.length){
			var f = function(success, node){
				if(success && node){
					var n = node.findChild(attr, v);
					if(n){
						n.select();
						if(callback){
							callback(true, n);
						}
					}else if(callback){
						callback(false, n);
					}
				}else{
					if(callback){
						callback(false, n);
					}
				}
			};
			this.expandPath(keys.join(this.pathSeparator), attr, f);
		}
	},

	expandPath : function(path, attr, callback){
		if(Ext.isEmpty(path)){
			if(callback){
				callback(false, undefined);
			}
			return;
		}
		attr = attr || 'id';
		var keys = path.split(this.pathSeparator);
		var curNode = this.root;
		var index = 0;
		var s = this.pathSeparator;
		var f = function(){
			if(index == keys.length){
				if(callback){
					callback(true, curNode);
				}
				return;
			}
			++index;
			var c = curNode.findChild(attr, s+keys.slice(0,index).join(s));
			if(!c){
				if(callback){
					callback(false, curNode);
				}
				return;
			}
			curNode = c;
			c.expand(false, false, f);
		};
		curNode.expand(false, false, f);
	}
});

/**
 * @class Ext.ux.fielmng.Panel
 * @extends Ext.Panel
 * Manager files and images
 * @xtype filemng
 */
ns.Panel  = Ext.extend(Ext.Panel,{

	/**
	 * @cfg {String} baseUrl Базовый адрес - с него будет начинаться адрес файла для показа в браузере.
	 */
	baseUrl:'data',
	urlAction:'adapter/php/index.php',
	cls:'x-filemng-panel',
	editNameSelector:'.file-name',
	layout:'border',
	enableHotkeys:true,
	newFolderName:t('Новая папка'),
	buttonsCfg:'refresh,|,addfolder,del,|,copy,cut,paste,|,rename,|,upload_file,|,toggle_tree,toggle_property,|,view_list,view_icon,|,->,find',
	buttonsBar:{
		find:{
			xtype:'textfield',
			enableKeyEvents:true,
			emptyText:'Поиск',
			cls:'search'
		},
		refresh:{
			iconCls:'b-refresh',
			tooltip:t('Обновить')+'(Ctrl+R)'
		},
		folderup:{
			iconCls:'b-up',
			tooltip:t('Выйти из папки')
		},
		undo:{
			iconCls:'b-undo',
			tooltip:t('Отмена')+'(Ctrl+Z)'
		},
		redo:{
			iconCls:'b-redo',
			tooltip:t('Повтор')+'(Ctrl+Y)'
		},
		addfolder: {
			iconCls:'b-addfolder',
			text:t('Новая папка'),
			tooltip:t('Создать новую папку в текущей директрии')
		},
		rename: {
			iconCls:'b-rename',
			text:t('Переименовать'),
			tooltip:t('Переименовать')+'(F2)'
		},
		del: {
			iconCls:'b-del',
			text:t('Удалить'),
			tooltip:t('Удалить')
		},
		toggle_tree: {
			iconCls:'b-toggle-tree',
			enableToggle:true,
			pressed:true,
			tooltip:t('Показать дерево папок')
		},
		toggle_property: {
			iconCls:'b-toggle-property',
			enableToggle:true,
			pressed:true,
			tooltip:t('Показать свойства')
		},
		upload_file: {
			iconCls:'b-upload-file',
			text:t('Загрузить'),
			enableToggle:true,
			tooltip:t('Загрузить файл')
		},
		copy:{
			iconCls:'b-copy-file',
			//text:t('Копировать'),
			tooltip:t('Копировать файл')
		},
		cut:{
			iconCls:'b-cut-file',
			tooltip:t('Вырезать файл')
		},
		paste:{
			iconCls:'b-paste-file',
			tooltip:t('Вставить файл')
		},
		view_list:{
			iconCls:'b-view-list',
			enableToggle:true,
			toggleGroup:'view',
			tooltip:t('Показать списком файлы')
		},
		view_icon:{
			iconCls:'b-view-icon',
			enableToggle:true,
			toggleGroup:'view',
			tooltip:t('Показать иконками файлы')
		}
	},
	hotkeys:[{
		key:'r',
		ctrl:true,
		cmd:'refresh',
		stopEvent:true
	},{
		key:'z',
		ctrl:true,
		cmd:'undo',
		stopEvent:true
	},{
		key:'y',
		ctrl:true,
		cmd:'redo',
		stopEvent:true
	},{
		key:Ext.EventObject.F2,
		cmd:'rename',
		stopEvent:true
	},{
		key:'x',
		ctrl:true,
		cmd:'cut',
		stopEvent:true
	},{
		key:'c',
		ctrl:true,
		cmd:'copy',
		stopEvent:true
	},{
		key:'v',
		ctrl:true,
		cmd:'paste',
		stopEvent:true
	},{
		key:'n',
		ctrl:true,
		cmd:'addfolder',
		stopEvent:true
	},{
		key:Ext.EventObject.DELETE,
		cmd:'del',
		stopEvent:true
	},{
		key:[Ext.EventObject.LEFT,Ext.EventObject.UP],
		cmd:'select_prev',
		stopEvent:true
	},{
		key:[Ext.EventObject.RIGHT,Ext.EventObject.DOWN],
		cmd:'select_next',
		stopEvent:true
	},{
		key:'a',
		cmd:'select_all',
		ctrl:true,
		stopEvent:true
	},{
		key:Ext.EventObject.ENTER,
		cmd:'open_selected',
		stopEvent:true
	},{
		key:Ext.EventObject.BACKSPACE,
		cmd:'up',
		stopEvent:true
	},{
		key:Ext.EventObject.LEFT,
		ctrl:true,
		cmd:'up',
		stopEvent:true
	}],
	// private
	action:function(controller,action){
		return this.urlAction+'/'+controller + (action?('/'+action):'') ;
	},
	actionParam:function(controller,action,params)
	{
		var a = this.action(controller,action);
		if(params){
			a += '?data=' + Ext.encode(params || {})
		}
		return a;
	},
	// private
	actionRequest:function(controller,action,params,callback,scope)
	{
		var o = {
			url: this.action(controller,action),
			params:{
				data:Ext.encode(params || {})
			}
		};
		if(callback) {
			o.callback =  function(options,success, response){
				var data = null;
				if(success) {
					data = Ext.decode(response.responseText);
				}
				callback.call(scope,data,success,response,options);
			};
		}
		return Ext.Ajax.request(o);
	},
	// private
	initComponent:function(){
		this.initTemplates();
		this.store = new Ext.data.JsonStore({
			// store configs
			autoDestroy: true,
			url: this.action('files'),
			idProperty: 'id',
			messageProperty:"message",
			successProperty:'success',
			root: 'data',
			fields: ns.FileRecord
		});
		this.pathBar = new ns.PathToolbar();
		this.elements += ',x-filemng-bar-button';
		var usertbar = this.tbar || [];
		this.tbar = this.pathBar;
		this.treePanel = new TreePanel({
			minWidth:100,
			width:250,
			region:'west',
			loader:new Ext.tree.TreeLoader({
				nodeParameter:'dir',
				dataUrl: this.action('files','getChildFolderTree')
			})
		});
		this.uploadPanel = new FileUploader({
			region:'north',
			border:false,
			hidden:true,
			fileMng:this
		});
		this.propertiesPanel = new Ext.Panel({
			bodyCssClass:'x-filemng-properties',
			region: 'south',
			border:false,
			split:true,
			height: 150,
			minSize: 75,
			maxSize: 250
		});
		
		this.listView = new ns.ListView({
			store: this.store,
			multiSelect: true,
			reserveScrollOffset: true,
			autoScroll:false,
			baseUrl:this.baseUrl,
			fileMng:this,
			plugins: [new DragSelector()]
		});
		this.items = [this.uploadPanel,this.treePanel,{
			region:'center',
			border:false,
			layout:'fit',
			codyStyle:{
				overflow: 'hidden'
			},
			items:this.listView
		},this.propertiesPanel];
		this.editor = new Ext.Editor({
			cls: 'x-small-editor',
			alignment: 'bl-bl?',
			autoSize:'width',
			field:new Ext.form.TextField({
				allowBlank: false,
				selectOnFocus:true
			}),
			doBlur: function(){
				if(this.editing){
					this.field.blur();
				}
			},
			onShow : function(){
				this.el.show();
				if(this.hideEl !== false){
					this.boundEl.hide();
				}
				this.field.show().focus();
				this.fireEvent("startedit", this.boundEl, this.startValue);
			}
		});
		ns.Panel.superclass.initComponent.call(this);
		this.waitIcon = Ext.DomHelper.createDom({tag:'img',src:Ext.BLANK_IMAGE_URL,cls:'wait',style:{display:'none'}});
		this.buttonBar = this.createToolbar(this.createButtons(this.buttonsCfg.split(',')).concat(usertbar,['->',this.waitIcon]),{enableOverflow: true});
		this.waitIcon = Ext.get(this.waitIcon);
		this.initCmd();
		if(this.buttonsBar.find)
		{
			this.buttonsBar.find.on('keydown',this.onFind,this,{buffer:300});
			this.buttonsBar.find.on('change',this.onFind,this);
		}
	},
	/**
	* Проверка файла на существование
	*/
	fileExist:function(name, callback, scope){
		Ext.Ajax.request({
			url:this.action('files','exists'),
			params:{
				dir:this.getFolder(),
				name:name
			},
			success:function(response){
				var data = Ext.decode(response.responseText);
				callback.call(scope,!!data.data);
			}
		});
	},
	selectRecords:function(records,keepExisting){
		if(this.listView)
		{
			this.listView.select(records,keepExisting);
		}
	},
	selectRange:function(start,end,keepExisting){
		if(this.listView)
		{
			this.listView.selectRange(records,keepExisting);
		}
	},
	selectPrev:function(){
		if(this.listView)
		{
			var i = 0;
			var is = this.listView.getSelectedIndexes();
			if(is.length){
				i = is[0]-1;
				if(i<0) i = 0;
			}
			this.listView.selectRange(i,i);
		}
	},
	selectNext:function(){
		if(this.listView)
		{
			var i = 0;
			var is = this.listView.getSelectedIndexes();
			if(is.length){
				i = is.sort()[is.length-1] + 1;
				if(i >= this.store.getCount()){
					i = this.store.getCount()-1;
				}
			}
			this.listView.selectRange(i,i);
			
		}
	},
	selectAll:function(){
		if(this.listView)
		{
			this.listView.selectRange(0,this.store.getCount());
		}
	},
	up:function(){
		var t = this.getFolder().split('/').filter(function(c){return c});
		t.splice(t.length-1,1)
		this.setFolder('/'+t.join('/'))
	},
	getSelectedRecord:function(){
		if(this.listView)
		{
			return this.listView.getSelectedRecords() || [];
		}
		return [];
	},
	getSelectedFiles:function(){
		return this.getSelectedRecord().map(function(c){return c.data;});
	},
	getSelectedPath:function(){
		return this.getSelectedRecord().map(function(c){return c.id;});
	},
	openSelected:function()
	{
		var records = this.getSelectedRecord();
		this.open(records[0]);
	},
	// private
	showWait:function(){
		this.waitIcon.show();
	},
	// private
	hideWait:function(){
		this.waitIcon.hide();
	},
	/**
	* Обновить список файлов
	*/
	refresh:function(){
		this.store.reload();
		var node = this.treePanel.getNodeById(this.path);
		if(node && node.isLoaded())
		{
			node.reload();
		}
	},
	/**
	* Удалить файлы
	*/
	deleteFile:function(files){
		var data = [];
		for(var i = 0,l=files.length;i<l;++i) data.push(files[i].get('id'));
		this.actionRequest('files','remove',{'files':data},function(data,success){
			if(success && data.success){
				this.refresh();
			} else {
				Ext.Msg.alert(t('Удаление'), data && data.message || t('Не удалось удалить.'));
			}
		},this);
	},
	/**
	* Переименовать файл в текущей дериктории
	*/
	rename:function(file,name){
		if(file)
		{
			var node = this.listView.getNode(file);
			if(node){
				this.scrollNode(node);
				node = Ext.get(node).query(this.editNameSelector);
				var value = name || file.get('name');
				if(node && node.length) {
					this.editor.startEdit(node[0],value);
					if(file.get('type') != 'folder'){
						this.editor.field.selectText(0,value.lastIndexOf('.'));
					}
					this.activeRecord = file;
				}
			}
		}
	},
	// private
	onRenameSave:function(ed, value){
		if(value){
			var oldvalue = this.activeRecord.get('name');
			if(oldvalue != value){
				if(this.activeRecord.phantom)
				{
					var path = this.activeRecord.get('path');
					this.actionRequest('files','newfolder',{path:path,name:value},function(data,success){
						if(success && data.success){
							this.activeRecord.data = data.data;
							if(data.data.lastmod){
								this.activeRecord.data.lastmod = Date.parseDate(data.data.lastmod,'U');
							}
							this.activeRecord.commit();
							this.activeRecord.phantom = false;
							var node = this.treePanel.getNodeById(path);
							if(node){
								node.reload();
							}
						} else {
							Ext.Msg.alert(t('Создание новой папки'), data && data.message || t('Не удалось создать папку.'));
							this.store.remove(this.activeRecord);
							this.activeRecord = null;
						}
					},this);
				}
				else
				{
					var path = this.activeRecord.get('id');
					this.actionRequest('files','rename',{path:path,name:value},function(data,success){
						if(success && data.success){
							this.activeRecord.data = data.data;
							if(data.data.lastmod){
								this.activeRecord.data.lastmod = Date.parseDate(data.data.lastmod,'U');
							}
							this.activeRecord.commit();
							var id = path.substr(0,path.lastIndexOf('/'));
							if(id.indexOf('/') != 0) id = '/'+id;
							var node = this.treePanel.getNodeById(id);
							if(node){
								node.reload();
							}
						} else {
							Ext.Msg.alert(t('Переименовывание'), data && data.message || t('Не получилось переименовать.'));
						}
					},this);
				}
			}
		}
	},
	// private
	onLoadData:function(data){
		this.store.loadData(data);
		this.autoDetectTypeView();
	},
	// private
	autoDetectTypeView:function(){
		var folder = this.getFolder();
		var type = Ext.state.Manager.get('filemng-view-state-'+this.getFolder());
		if(!type)
		{
			type = (this.store.find('type','image')!=-1)?'icon':'list';
		}
		this.setTypeView(type,false);
	},
	/**
	* Перейти в деректорию path
	*/
	setFolder:function(path){
		if(this.path != path) {
			this.path = path;
			this.pathBar.setFolder(path);
			this.store.setBaseParam('dir',path);
			this.store.load({callback:this.autoDetectTypeView,scope:this});
			if(this.treePanel){
				this.treePanel.selectPath(path);
			}
			this.saveState();
		}
	},
	/**
	* Получить путь к выбранной директории
	*/
	getFolder:function(){
		return this.path;
	},
	 // private
	getState : function(){
		return {
			statePath:this.path,
			treePanelHidden:this.treePanel.hidden,
			propertiesPanelHidden:this.propertiesPanel.hidden
		};
	},
	// private
	applyState : function(state){
		ns.Panel.superclass.applyState.call(this,state);
		if(state) {
			this.buttonsBar.toggle_tree.pressed = !(this.treePanel.hidden = this.treePanelHidden);
			this.buttonsBar.toggle_property.pressed = !(this.propertiesPanel.hidden = this.propertiesPanelHidden);
			this.treePanel.on('load',function(){
				this.setFolder(this.statePath || '/');
			},this,{single:true});
		}
	},
	/**
	* Добавить команду
	*/
	addCmd:function(cmd,fn,scope){
		if('object' == typeof cmd){
			if(cmd.cmd && cmd.fn)
			{
				this.addCmd(cmd.cmd,cmd.fn,cmd.scope);
			} else {
				for(var n in cmd) {
					if(n != 'scope' && n != 'cmd'){
						this.addCmd(n,cmd[n],cmd.scope);
					}
				}
			}
			return;
		} else {
			this.commands[cmd] = {
				fn:fn,
				scope: scope || this
			};
		}
	},
	/**
	* Выполнить команду
	*/
	exeCmd:function(name,arg){
		var cmd = this.commands[name];
		if(cmd){
			return cmd.fn.apply(cmd.scope,arg || []);
		}
	},
	onLinkExtCmd:function(e){
		var t = e.getTarget('a.ext-cmd');
		if(t){
			var cmd = t.id.replace('cmd_','');
			this.exeCmd(cmd);
			e.stopEvent();
		}
	},
	// private
	createCmdHandler:function(cmd){
		return function(){
			return this.exeCmd(cmd, arguments);
		}
	},
	// private
	initCmd:function(){
		this.commands = {};
		this.addCmd({
			'refresh':this.onRefresh,
			'addfolder':this.onAddFolder,
			'del':this.onDelete,
			'rename':this.onRename,
			'toggle_tree': this.onTogglePanel(this.treePanel),
			'toggle_property':this.onTogglePanel(this.propertiesPanel),
			'upload_file':this.onUploadToggle,
			'upload_file_show':this.uploadShow,
			'upload_file_hide':this.uploadHide,
			'copy':this.onCopyFile,
			'paste':this.onPasteFile,
			'cut':this.onCutFile,
			'select_prev':this.selectPrev,
			'select_next':this.selectNext,
			'select_all':this.selectAll,
			'open_selected':this.openSelected,
			'up':this.up,
			'load_arhive':this.loadArhiveSelectFile,
			'view_list':this.setTypeView.createDelegate(this,['list'],0),
			'view_icon':this.setTypeView.createDelegate(this,['icon'],0)
		});
	},
	// private
	initTemplates:function(){
		this.tpls = {
			'file':new Ext.XTemplate(
				'<ul>',
					'<li>',t('Имя файла'),': <b>{name}<tpl if="type!=\'dir\'"> <a href="'+this.baseUrl+'{id}" target="_blank" class="b-download">',t('Скачать'),'</a> <a href="javascript:void(0)" class="ext-cmd b-download" id="cmd_load_arhive">'+t('Скачать архивом')+'</a></tpl></b></li>',
					'<tpl if="lastmod"><li>',t('Время изменения'),': <b>{lastmod:date("d.m.Y h:i:s")}</b></li></tpl>',
					'<tpl if="size"><li>',t('Размер файла'),': <b>{size:fileSize}</b></li></tpl>',
				'</ul>'
			),
			'folder':new Ext.XTemplate(
				'<ul>',
					'<li>',t('Папка с файлами'),': <b>{name}</b></li>',
					'<li><a href="javascript:void(0)" class="ext-cmd b-download" id="cmd_load_arhive">'+t('Скачать архивом')+'</a></li>',
				'</ul>'
			),
			'image': new Ext.XTemplate('<table><tr>',
				'<td>',box('<div class="wrap-image"><img src="'+this.baseUrl+'{id}" height="100" alt="{name}"/><div class="magnifier" ></div><div class="white" ></div></div>'),'</td>',
				'<td><ul>',
					'<li>',t('Имя файла'),': <b>{name}</b> <a href="'+this.baseUrl+'{id}" target="_blank" class="b-download">Скачать</a> <a href="javascript:void(0)" class="ext-cmd b-download" id="cmd_load_arhive">'+t('Скачать архивом')+'</a></li>',
					'<tpl if="lastmod"><li>',t('Время изменения'),': <b>{lastmod:date("d.m.Y h:i:s")}</b></li></tpl>',
					'<tpl if="size"><li>',t('Размер файла'),': <b>{size:fileSize}</b></li></tpl>',
					'<li>',t('Ширина'),': <b>{width}px</b></li>',
					'<li>',t('Высота'),': <b>{height}px</b></li>',
				'</ul></td>',
				'</tr></table>'
			),
			'select': new Ext.Template(
				'<ul>',
					'<li>',t('Выбрано элементов'),': <b>{number}</b> из <b>{numberFolder}</b></li>',
					//'<tpl if="size"><li>',t('Размер файлов'),': <b>{size:fileSize}</b></li></tpl>',
					'<li><a href="javascript:void(0)" class="ext-cmd b-download" id="cmd_load_arhive">'+t('Скачать архивом')+'</a></li>',
				'</ul>'
			),
			'noselect': new Ext.Template(
				'<ul>',
					'<li>',t('Папка с файлами'),': <b>{name}</b></li>',
					'<li>',t('Элементов в папке'),': <b>{numberFolder}</b></li>',
					'<li><a href="javascript:void(0)" class="ext-cmd b-download" id="cmd_load_arhive">'+t('Скачать архивом')+'</a></li>',
				'</ul>'
			)
		};
	},
	// private
	getTemplateInfo:function(type){
		if(type in this.tpls){
			return this.tpls[type];
		}
		return this.tpls.file;
	},
	//private
	initEvents:function(){
		ns.Panel.superclass.initEvents.call(this);
		this.treePanel.on('click',this.onSelectTreeFolder,this);
		this.pathBar.on('select',this.onSelectPathBar,this);
		this.store.on({
			'beforeload':this.showWait,
			'load':this.hideWait,
			'exception':function(a,b,c,d,e ){
				this.hideWait();
			},
			scope:this
		});
		this.listView.on({
			dblclick:this.dblClickFile,
			selectionchange:this.onSelectFileScroll,
			render:this.onSelectFileChange,
			scope:this
		});
		this.listView.on('selectionchange',this.onSelectFileChange,this,{buffer:50});
		if(this.listView.rendered){
			this.onSelectFileChange(this.listView);
		}
		this.store.on('load',function(){this.onSelectFileChange(this.listView);},this);
		
		this.listView.on('containerclick',this.editor.doBlur,this.editor);
		this.editor.on({
			'complete':this.onRenameSave, 
			scope:this
		});
		Ext.data.DataProxy.on('exception', function(proxy, type, action, o, res) {
			Ext.Msg.alert(t('Ошибка'),res.message);
		});
		this.el.on('click',this.onLinkExtCmd,this,{delegate:'a.ext-cmd'});
	},
	// private
	initHotKeys:function()
	{
		if(this.enableHotkeys)
		{
			var hk = [];
			for(var i = 0,l=this.hotkeys.length;i<l;++i)
			{
				hk.push(Ext.apply({
					fn:this.createCmdHandler(this.hotkeys[i].cmd),
					scope:this
				},this.hotkeys[i]));
			}
			this.keyMap = new Ext.KeyMap(Ext.getDoc(), hk);
			this.keyMap.enable();
		}
	},
	// private
	dblClickFile:function(view,index,node,e )
	{
		this.open(this.store.getAt(index));
	},
	open:function(record){
		if(record.get('type') == 'folder') {
			this.openFolder(record.get('id'));
		} else {
			this.openFile(record.get('id'),record.get('type'));
		}
	},
	onSelectFileChange:function(view,selections){
		var records = this.getSelectedRecord();
		var info = '';
		if(records.length == 1){
			var tpl = this.getTemplateInfo(records[0].get('type'));
			info = tpl.apply(records[0].data);
		} else {
			var tpl = this.getTemplateInfo(records.length?'select':'noselect');
			info = tpl.apply({name:this.path,number:records.length, numberFolder: this.store.getCount()});
		}
		this.propertiesPanel.body.update(info)
		imagesLoader(this.propertiesPanel.body);
	},
	onSelectFileScroll:function(){
		var nodes = this.listView.getSelectedNodes();
		if(nodes.length){
			this.scrollNode(nodes);
		}
	},
	scrollNode:function(node){
		Ext.get(node).scrollIntoView(this.listView.getTemplateTarget().parent(),true);
	},
	openFolder:function(path){
		this.setFolder(path);
	},
	openFile:function(path,type){
		var win = window.open(this.baseUrl+path.replace(/^\/+/,''));
	},
	// private
	createButtons:function(buttons){
		var res = [];
		var bb = {};
		for(var i = 0,l=buttons.length;i<l;++i){
			var n = buttons[i];
			if(n == '|') {
				res.push('-');
			} else if(n == '->'){
				res.push('->');
			} else {
				var b = this.buttonsBar[n];
				if(b){
					b = Ext.create(Ext.apply({
						handler:this.createCmdHandler(b.cmd || n),
						scope:this
					},this.buttonsBar[n]),'button');
					if(b) {
						bb[n] = b;
						res.push(b);
					}
				}
			}
		}
		this.buttonsBar = bb;
		return res;
	},
	// private
	onRender : function(ct, position){
		ns.Panel.superclass.onRender.call(this, ct, position);
		if(this.tbar && this.buttonBar)
		{
			this.buttonBar.ownerCt = this;
			this.buttonBar.render(this.tbar);
		}
		this.initHotKeys();
	},
	// private
	onTogglePanel:function(panel){
		return function(b){
			panel.setVisible(b.pressed);
			this.doLayout();
			this.saveState();
		};
	},
	// private
	onSelectTreeFolder:function(node){
		this.openFolder(node.id);
	},
	// private
	onSelectPathBar:function(bar,path){
		this.openFolder(path);
	},
	// private
	onDelete:function(){
		var records = this.listView.getSelectedRecords();
		if(records && records.length) {
			Ext.Msg.confirm(t('Удаление'), t('Выдействительно хотите удалить?'), function(btn){if (btn == 'yes'){
				this.deleteFile(records);
			}},this);
		}
	},
	// private
	onRename:function(){
		var records = this.listView.getSelectedRecords();
		if(records && records.length) {
			this.rename(records[0]);
		}
	},
	// private
	onAddFolder:function(){ 
		var folder = new ns.FileRecord({
			type:'folder',
			path:this.path,
			size:0
		});
		this.store.insert(0,folder);
		this.rename(folder,this.newFolderName);
	},
	// private
	onRefresh:function(){
		this.refresh();
	},
	// private
	onUploadToggle:function(button){
		if(button.pressed){
			this.uploadShow();
		} else {
			this.uploadHide();
		}
	},
	// private
	onFind:function(field){
		var v = field.getValue();
		if(v){
			this.store.filter('name',v, true);
		} else {
			this.store.clearFilter();
		}
	},
	// private
	uploadShow:function(){
		if(this.uploadPanel.hidden)
		{
			this.uploadPanel.show();
			this.doLayout();
		}
		if(this.buttonsBar.upload_file){
			this.buttonsBar.upload_file.toggle(true);
		}
	},
	// private
	uploadHide:function(){
		if(!this.uploadPanel.hidden)
		{
			this.uploadPanel.hide();
			this.doLayout();
		}
		if(this.buttonsBar.upload_file){
			this.buttonsBar.upload_file.toggle(false);
		}
	},
	// private
	onPasteFile:function(){
		var folder = this.getFolder();
		if(this.fileAction && this.fileAction.files && this.fileAction.files.length && this.fileAction.type) {
			if(folder != this.fileAction.folder)
			{
				this.actionRequest('files',this.fileAction.type,{target:folder,source:this.fileAction.folder,files:this.fileAction.files.map(function(c){return c.id})},function(data,success){
					if(success && data.success){
						this.onLoadData(data);
						var node = this.treePanel.getNodeById(folder);
						if(node){
							node.reload();
						}
					} else {
						Ext.Msg.alert(t('Копирование'), data && data.message || t('Не удалось скопировать.'));
					}
				},this);
			}
		}
		this.clearAction();
	},
	// private
	onCutFile:function(){
		var files = this.getSelectedRecord();
		if(files.length){
			this.clearAction();
			this.fileAction = {
				type:'cut',
				folder: this.getFolder(),
				files:files.map(function(rec){
					rec.set('action','cut');
					return rec.data
				})
			}
		}
	},
	// private
	onCopyFile:function(){
		var files = this.getSelectedRecord();
		if(files.length){
			this.clearAction();
			this.fileAction = {
				type:'copy',
				folder: this.getFolder(),
				files:files.map(function(rec){
					rec.set('action','copy');
					return rec.data
				})
			}
		}
	},
	/**
	* Сбросить действия с файлов
	*/
	clearAction:function()
	{
		this.store.each(function(rec){rec.set('action','');});
	},
	
	/**
	* Выставить тип отображения файлов
	*/
	setTypeView:function(type, state){
		this.listView.setTypeView(type);
		var name = 'view_'+type;
		if(this.buttonsBar[name]){
			this.buttonsBar[name].toggle(true);
		}
		if(state !== false){
			Ext.state.Manager.set('filemng-view-state-'+this.getFolder(),type);
		}
	},
	getInfoFile:function(path, callback,scope){
		this.actionRequest('files','getInfo',{path:path},callback,scope);
	},
	getInfoSelectFile:function(callback,scope){
		this.getInfoFile(filemng.getSelectedPath()[0],callback,scope);
	},
	loadArhiveSelectFile:function(){
		var files = this.getSelectedPath();
		if(!(files && files.length)){
			files = [this.getFolder()];
		}
		var win = window.open(this.actionParam('files','arhive',{files:files}));
	}
});
})(Ext.ux.filemng,Ext.ux.filemng.local);
Ext.reg('filemng', Ext.ux.filemng.Panel);
